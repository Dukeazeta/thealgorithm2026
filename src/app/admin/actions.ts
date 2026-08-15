"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDatabase } from "@/db/client";
import {
  auditLogs,
  galleryItems,
  graduates,
  memorySubmissions,
  storyChapters,
  storyMemories,
  storyStats,
} from "@/db/schema";
import { loginAdmin, logoutAdmin, requireAdmin } from "@/lib/auth";
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

export async function reviewSubmissionAction(formData: FormData) {
  const admin = await requireAdmin();
  const submissionId = String(formData.get("submissionId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const reviewNotes = String(formData.get("reviewNotes") ?? "").trim() || null;
  if (!submissionId || !["approved", "rejected"].includes(decision)) {
    throw new Error("Invalid moderation request.");
  }

  const database = getDatabase();
  const rows = await database
    .select()
    .from(memorySubmissions)
    .where(eq(memorySubmissions.id, submissionId))
    .limit(1);
  const submission = rows[0];
  if (!submission) throw new Error("Submission not found.");

  await database
    .update(memorySubmissions)
    .set({
      status: decision as "approved" | "rejected",
      reviewNotes,
      reviewedBy: admin.userId,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(memorySubmissions.id, submissionId));

  if (decision === "approved" && submission.mediaAssetId) {
    const slugBase = submission.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 70);
    const slug = `memory-${slugBase || "archive-entry"}-${submission.id.slice(0, 8)}`;
    const existingGalleryItem = await database
      .select({ id: galleryItems.id })
      .from(galleryItems)
      .where(eq(galleryItems.slug, slug))
      .limit(1);

    if (!existingGalleryItem[0]) {
      await database.insert(galleryItems).values({
        id: crypto.randomUUID(),
        slug,
        title: submission.title,
        category: submission.category,
        year: "2026",
        location: "Class Archive",
        mediaAssetId: submission.mediaAssetId,
        alt: submission.title,
        caption: submission.caption,
        tag: "Community Memory",
        status: "published",
        sortOrder: 0,
      });
    }
  }

  await audit(admin.userId, decision, "memory_submission", submissionId);
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
