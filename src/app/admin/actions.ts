"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDatabase } from "@/db/client";
import {
  auditLogs,
  galleryItems,
  graduates,
  memorySubmissions,
  mediaAssets,
  submissionBatches,
  storyChapters,
  storyMemories,
  storyStats,
} from "@/db/schema";
import { loginAdmin, logoutAdmin, requireAdmin } from "@/lib/auth";
import { deletePublicImages } from "@/lib/blob";
import { moderationSelectionSchema } from "@/lib/contribution";
import {
  adminLoginSchema,
  galleryItemSchema,
  graduateSchema,
  storyChapterSchema,
  storyMemorySchema,
  storyStatSchema,
} from "@/lib/validation";

export type ActionState = { error?: string };

function parseJsonField<T>(formData: FormData, field: string) {
  const value = formData.get(field);
  if (typeof value !== "string") throw new Error(`Missing ${field}`);
  return JSON.parse(value) as T;
}

async function audit(
  adminUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  await getDatabase().insert(auditLogs).values({
    id: crypto.randomUUID(),
    adminUserId,
    action,
    entityType,
    entityId,
    metadata: JSON.stringify(metadata),
  });
}

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  try {
    await loginAdmin(parsed.data.email, parsed.data.password);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Login failed." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/admin/login");
}

export async function reviewSubmissionBatchAction(formData: FormData) {
  const admin = await requireAdmin();
  const submissionIds = formData.getAll("submissionIds").map(String).filter(Boolean);
  const decision = String(formData.get("decision") ?? "");
  const reviewNotes = String(formData.get("reviewNotes") ?? "").trim() || null;
  if (!moderationSelectionSchema.safeParse(submissionIds).success || !["approved", "rejected"].includes(decision)) {
    throw new Error("Invalid moderation request.");
  }

  const database = getDatabase();
  const submissions = await database
    .select()
    .from(memorySubmissions)
    .where(and(inArray(memorySubmissions.id, submissionIds), eq(memorySubmissions.status, "pending")));
  if (submissions.length === 0) return;
  if (submissions.length !== submissionIds.length || submissions.some((item) => !item.mediaAssetId)) {
    throw new Error("Some selected photos are no longer ready for moderation.");
  }
  const batchIds = new Set(submissions.map((item) => item.batchId).filter(Boolean));
  if (batchIds.size > 1) throw new Error("Selected photos must belong to one batch.");

  if (decision === "rejected") {
    const assets = await database
      .select({ pathname: mediaAssets.blobPathname })
      .from(mediaAssets)
      .where(inArray(mediaAssets.id, submissions.map((item) => item.mediaAssetId!)));
    await deletePublicImages(assets.map((asset) => asset.pathname));
  }

  const now = new Date().toISOString();
  await database.transaction(async (transaction) => {
    if (decision === "approved") {
      for (const submission of submissions) {
        const slugBase = submission.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 70);
        await transaction.insert(galleryItems).values({
          id: `gallery-${submission.id}`,
          slug: `memory-${slugBase || "archive-entry"}-${submission.id.slice(0, 8)}`,
          title: submission.title,
          category: submission.category,
          year: "2026",
          location: "Class Archive",
          mediaAssetId: submission.mediaAssetId!,
          alt: `${submission.title}, photo ${submission.ordinal ?? 1}`,
          caption: submission.caption,
          tag: "Community Memory",
          status: "published",
          sortOrder: 0,
        }).onConflictDoNothing();
      }
    } else {
      await transaction.update(mediaAssets).set({ status: "deleted" }).where(inArray(mediaAssets.id, submissions.map((item) => item.mediaAssetId!)));
    }
    await transaction.update(memorySubmissions).set({
      status: decision as "approved" | "rejected",
      reviewNotes,
      reviewedBy: admin.userId,
      reviewedAt: now,
      updatedAt: now,
    }).where(inArray(memorySubmissions.id, submissions.map((item) => item.id)));
  });

  const batchId = submissions[0]?.batchId;
  if (batchId) {
    const remaining = await database.select({ id: memorySubmissions.id }).from(memorySubmissions).where(and(eq(memorySubmissions.batchId, batchId), eq(memorySubmissions.status, "pending"))).limit(1);
    await database.update(submissionBatches).set({ status: remaining.length ? "pending" : "reviewed", updatedAt: now }).where(eq(submissionBatches.id, batchId));
  }

  await audit(admin.userId, decision, "submission_batch", batchId ?? submissions[0].id, { submissionIds: submissions.map((item) => item.id) });
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/gallery");
  revalidatePath("/api/gallery");
}

export async function saveGraduateAction(formData: FormData) {
  const admin = await requireAdmin();
  const input = parseJsonField<Record<string, unknown>>(formData, "payload");
  const id = typeof input.id === "string" ? input.id : undefined;
  const parsed = graduateSchema.safeParse(input);
  if (!parsed.success) throw new Error("Graduate data is invalid.");
  const database = getDatabase();
  const values = {
    ...parsed.data,
    departmentFriends: JSON.stringify(parsed.data.departmentFriends),
    mediaAssetId: parsed.data.mediaAssetId ?? null,
    updatedAt: new Date().toISOString(),
  };

  if (id) {
    await database.update(graduates).set(values).where(eq(graduates.id, id));
  } else {
    const createdId = crypto.randomUUID();
    await database.insert(graduates).values({ id: createdId, ...values });
    await audit(admin.userId, "created", "graduate", createdId);
  }

  if (id) await audit(admin.userId, "updated", "graduate", id);
  revalidatePath("/graduates");
  revalidatePath("/api/graduates");
  revalidatePath("/admin/graduates");
}

export async function saveGalleryAction(formData: FormData) {
  const admin = await requireAdmin();
  const input = parseJsonField<Record<string, unknown>>(formData, "payload");
  const id = typeof input.id === "string" ? input.id : undefined;
  const parsed = galleryItemSchema.safeParse(input);
  if (!parsed.success) throw new Error("Gallery data is invalid.");
  const database = getDatabase();
  const values = { ...parsed.data, updatedAt: new Date().toISOString() };

  if (id) {
    await database.update(galleryItems).set(values).where(eq(galleryItems.id, id));
  } else {
    const createdId = crypto.randomUUID();
    await database.insert(galleryItems).values({ id: createdId, ...values });
    await audit(admin.userId, "created", "gallery_item", createdId);
  }

  if (id) await audit(admin.userId, "updated", "gallery_item", id);
  revalidatePath("/gallery");
  revalidatePath("/api/gallery");
  revalidatePath("/admin/gallery");
}

export async function saveStoryChapterAction(formData: FormData) {
  const admin = await requireAdmin();
  const input = parseJsonField<Record<string, unknown>>(formData, "payload");
  const id = typeof input.id === "string" ? input.id : undefined;
  const parsed = storyChapterSchema.safeParse(input);
  if (!parsed.success) throw new Error("Story chapter data is invalid.");
  const database = getDatabase();
  const values = {
    ...parsed.data,
    narrative: JSON.stringify(parsed.data.narrative),
    keyCourses: JSON.stringify(parsed.data.keyCourses),
    quoteText: parsed.data.quoteText,
    quoteAuthor: parsed.data.quoteAuthor,
    updatedAt: new Date().toISOString(),
  };

  if (id) {
    await database.update(storyChapters).set(values).where(eq(storyChapters.id, id));
  } else {
    const createdId = crypto.randomUUID();
    await database.insert(storyChapters).values({ id: createdId, ...values });
    await audit(admin.userId, "created", "story_chapter", createdId);
  }

  if (id) await audit(admin.userId, "updated", "story_chapter", id);
  revalidatePath("/story");
  revalidatePath("/api/story");
  revalidatePath("/admin/story");
}

export async function saveStoryMemoryAction(formData: FormData) {
  const admin = await requireAdmin();
  const input = parseJsonField<Record<string, unknown>>(formData, "payload");
  const id = typeof input.id === "string" ? input.id : undefined;
  const parsed = storyMemorySchema.safeParse(input);
  if (!parsed.success) throw new Error("Story memory data is invalid.");
  const database = getDatabase();
  const values = { ...parsed.data, updatedAt: new Date().toISOString() };

  if (id) {
    await database.update(storyMemories).set(values).where(eq(storyMemories.id, id));
  } else {
    const createdId = crypto.randomUUID();
    await database.insert(storyMemories).values({ id: createdId, ...values });
    await audit(admin.userId, "created", "story_memory", createdId);
  }

  if (id) await audit(admin.userId, "updated", "story_memory", id);
  revalidatePath("/story");
  revalidatePath("/api/story");
  revalidatePath("/admin/story");
}

export async function saveStoryStatAction(formData: FormData) {
  const admin = await requireAdmin();
  const input = parseJsonField<Record<string, unknown>>(formData, "payload");
  const id = typeof input.id === "string" ? input.id : undefined;
  const parsed = storyStatSchema.safeParse(input);
  if (!parsed.success) throw new Error("Story stat data is invalid.");
  const database = getDatabase();
  const values = { ...parsed.data, updatedAt: new Date().toISOString() };

  if (id) {
    await database.update(storyStats).set(values).where(eq(storyStats.id, id));
  } else {
    const createdId = crypto.randomUUID();
    await database.insert(storyStats).values({ id: createdId, ...values });
    await audit(admin.userId, "created", "story_stat", createdId);
  }

  if (id) await audit(admin.userId, "updated", "story_stat", id);
  revalidatePath("/story");
  revalidatePath("/api/story");
  revalidatePath("/admin/story");
}
