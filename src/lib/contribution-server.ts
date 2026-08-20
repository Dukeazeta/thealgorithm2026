import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { del, head, type PutBlobResult } from "@vercel/blob";
import { and, eq, inArray } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import {
  mediaAssets,
  memorySubmissions,
  submissionBatches,
} from "@/db/schema";
import {
  completeBatchSchema,
  contributionBatchSchema,
  isExpectedUploadPath,
  isFinalizedSubmission,
  MAX_UPLOAD_IMAGE_BYTES,
  nextBatchUploadStatus,
  uploadPath,
  type ContributionBatchInput,
} from "@/lib/contribution";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";

export class ContributionError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "ContributionError";
  }
}

function tokenSecret() {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SESSION_SECRET is not configured");
  return secret;
}

export function hashContributionToken(token: string) {
  return createHmac("sha256", tokenSecret()).update(token).digest("hex");
}

export function contributionTokenMatches(token: string, storedHash: string) {
  const actual = Buffer.from(hashContributionToken(token), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function getBearerToken(request: Request) {
  const value = request.headers.get("authorization") ?? "";
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
}

export function getClientAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

async function deleteUnfinishedContributionBlobs(
  batchId: string,
  submissionIds: string[],
) {
  if (submissionIds.length === 0) return;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  await del(
    submissionIds.flatMap((submissionId) => [
      uploadPath(batchId, submissionId, "webp"),
      uploadPath(batchId, submissionId, "jpg"),
    ]),
    { token },
  );
}

async function requireBatch(batchId: string, editToken: string) {
  const rows = await getDatabase()
    .select()
    .from(submissionBatches)
    .where(eq(submissionBatches.id, batchId))
    .limit(1);
  const batch = rows[0];

  if (!batch || !editToken || !contributionTokenMatches(editToken, batch.editTokenHash)) {
    throw new ContributionError("Contribution batch not found.", 404);
  }
  return batch;
}

async function refreshBatchUploadStatus(batchId: string) {
  const database = getDatabase();
  const [batch, items] = await Promise.all([
    database
      .select({ status: submissionBatches.status })
      .from(submissionBatches)
      .where(eq(submissionBatches.id, batchId))
      .limit(1),
    database
      .select({ status: memorySubmissions.status })
      .from(memorySubmissions)
      .where(eq(memorySubmissions.batchId, batchId)),
  ]);

  if (batch[0]?.status !== "uploading") return;
  const nextStatus = nextBatchUploadStatus(items.map((item) => item.status));

  if (nextStatus !== "uploading") {
    await database
      .update(submissionBatches)
      .set({ status: nextStatus, updatedAt: new Date().toISOString() })
      .where(eq(submissionBatches.id, batchId));
  }
}

export async function createContributionBatch(
  input: ContributionBatchInput,
  clientAddress: string,
) {
  const parsed = contributionBatchSchema.safeParse(input);
  if (!parsed.success) {
    throw new ContributionError("Please check the contribution details.");
  }

  const limit = await consumeRateLimit(
    "contribution-batch",
    getRequestFingerprint(clientAddress),
    3,
    60 * 60 * 1000,
  );
  if (!limit.allowed) {
    throw new ContributionError("Too many batches. Try again later.", 429);
  }

  const batchId = crypto.randomUUID();
  const editToken = randomBytes(32).toString("base64url");
  const now = new Date().toISOString();
  const items = parsed.data.files.map((file, index) => ({
    id: crypto.randomUUID(),
    clientFileId: file.clientFileId,
    batchId,
    contributorName: parsed.data.contributorName,
    category: parsed.data.category,
    title: parsed.data.title,
    caption: parsed.data.caption,
    sourceFileName: file.name,
    sourceMimeType: file.type,
    sourceByteSize: file.size,
    sourceLastModified: file.lastModified,
    ordinal: index + 1,
    status: "uploading" as const,
  }));

  await getDatabase().transaction(async (transaction) => {
    await transaction.insert(submissionBatches).values({
      id: batchId,
      contributorName: parsed.data.contributorName,
      category: parsed.data.category,
      title: parsed.data.title,
      caption: parsed.data.caption,
      expectedCount: items.length,
      editTokenHash: hashContributionToken(editToken),
      status: "uploading",
      createdAt: now,
      updatedAt: now,
    });
    await transaction.insert(memorySubmissions).values(items);
  });

  return {
    batchId,
    editToken,
    items: items.map((item) => ({
      clientFileId: item.clientFileId,
      submissionId: item.id,
    })),
  };
}

export async function getContributionBatchStatus(batchId: string, editToken: string) {
  const batch = await requireBatch(batchId, editToken);
  const items = await getDatabase()
    .select({
      submissionId: memorySubmissions.id,
      clientFileId: memorySubmissions.clientFileId,
      name: memorySubmissions.sourceFileName,
      type: memorySubmissions.sourceMimeType,
      size: memorySubmissions.sourceByteSize,
      lastModified: memorySubmissions.sourceLastModified,
      ordinal: memorySubmissions.ordinal,
      status: memorySubmissions.status,
    })
    .from(memorySubmissions)
    .where(eq(memorySubmissions.batchId, batchId));

  return {
    batch: {
      id: batch.id,
      contributorName: batch.contributorName,
      category: batch.category,
      title: batch.title,
      caption: batch.caption,
      expectedCount: batch.expectedCount,
      status: batch.status,
    },
    items,
  };
}

export async function authorizeContributionUpload(
  batchId: string,
  submissionId: string,
  editToken: string,
  pathname: string,
) {
  const batch = await requireBatch(batchId, editToken);
  if (batch.status !== "uploading") {
    throw new ContributionError("This contribution batch is already closed.", 409);
  }
  if (!isExpectedUploadPath(pathname, batchId, submissionId)) {
    throw new ContributionError("The upload path is invalid.");
  }

  const rows = await getDatabase()
    .select()
    .from(memorySubmissions)
    .where(
      and(
        eq(memorySubmissions.id, submissionId),
        eq(memorySubmissions.batchId, batchId),
      ),
    )
    .limit(1);
  const submission = rows[0];
  if (!submission) throw new ContributionError("Photo placeholder not found.", 404);
  if (submission.status !== "uploading" || submission.mediaAssetId) {
    throw new ContributionError("This photo has already been uploaded.", 409);
  }
  return submission;
}

export async function finalizeContributionUpload({
  batchId,
  submissionId,
  blob,
  editToken,
  trustedCallback = false,
}: {
  batchId: string;
  submissionId: string;
  blob: Pick<PutBlobResult, "url" | "pathname" | "contentType">;
  editToken?: string;
  trustedCallback?: boolean;
}) {
  if (!trustedCallback) await requireBatch(batchId, editToken ?? "");
  if (!isExpectedUploadPath(blob.pathname, batchId, submissionId)) {
    throw new ContributionError("The uploaded photo path is invalid.");
  }

  const database = getDatabase();
  const rows = await database
    .select()
    .from(memorySubmissions)
    .where(
      and(
        eq(memorySubmissions.id, submissionId),
        eq(memorySubmissions.batchId, batchId),
      ),
    )
    .limit(1);
  const submission = rows[0];
  if (!submission) throw new ContributionError("Photo placeholder not found.", 404);
  if (isFinalizedSubmission(submission.status, submission.mediaAssetId)) {
    return { submissionId, status: submission.status };
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  const metadata = await head(blob.url, { token });
  if (
    metadata.pathname !== blob.pathname ||
    !isExpectedUploadPath(metadata.pathname, batchId, submissionId) ||
    !["image/webp", "image/jpeg"].includes(metadata.contentType) ||
    metadata.size <= 0 ||
    metadata.size > MAX_UPLOAD_IMAGE_BYTES
  ) {
    throw new ContributionError("The uploaded photo failed storage validation.");
  }

  const now = new Date().toISOString();
  await database.transaction(async (transaction) => {
    await transaction
      .insert(mediaAssets)
      .values({
        id: submissionId,
        blobUrl: metadata.url,
        blobPathname: metadata.pathname,
        mimeType: metadata.contentType,
        byteSize: metadata.size,
        altText: `${submission.title}, photo ${submission.ordinal ?? 1}`,
      })
      .onConflictDoNothing();
    await transaction
      .update(memorySubmissions)
      .set({
        mediaAssetId: submissionId,
        status: "pending",
        updatedAt: now,
      })
      .where(eq(memorySubmissions.id, submissionId));
  });

  await refreshBatchUploadStatus(batchId);
  return { submissionId, status: "pending" as const };
}

export async function removeContributionItem(
  batchId: string,
  submissionId: string,
  editToken: string,
) {
  const batch = await requireBatch(batchId, editToken);
  if (batch.status !== "uploading") {
    throw new ContributionError("This contribution batch is already closed.", 409);
  }

  const database = getDatabase();
  const rows = await database
    .select()
    .from(memorySubmissions)
    .where(
      and(
        eq(memorySubmissions.id, submissionId),
        eq(memorySubmissions.batchId, batchId),
      ),
    )
    .limit(1);
  const item = rows[0];
  if (!item) throw new ContributionError("Photo placeholder not found.", 404);
  if (item.status !== "uploading" || item.mediaAssetId) {
    throw new ContributionError("Uploaded photos cannot be removed here.", 409);
  }

  const nextCount = Math.max(0, batch.expectedCount - 1);
  await deleteUnfinishedContributionBlobs(batchId, [item.id]);
  await database.transaction(async (transaction) => {
    await transaction.delete(memorySubmissions).where(eq(memorySubmissions.id, item.id));
    await transaction
      .update(submissionBatches)
      .set({
        expectedCount: nextCount,
        status: nextCount === 0 ? "abandoned" : "uploading",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(submissionBatches.id, batchId));
  });
  await refreshBatchUploadStatus(batchId);
  return { expectedCount: nextCount };
}

export async function completeContributionBatch(
  batchId: string,
  input: unknown,
) {
  const parsed = completeBatchSchema.safeParse(input);
  if (!parsed.success) throw new ContributionError("Invalid completion request.");
  const batch = await requireBatch(batchId, parsed.data.editToken);
  if (batch.status !== "uploading") return getContributionBatchStatus(batchId, parsed.data.editToken);

  const database = getDatabase();
  if (parsed.data.discardSubmissionIds.length > 0) {
    const candidates = await database
      .select()
      .from(memorySubmissions)
      .where(
        and(
          eq(memorySubmissions.batchId, batchId),
          inArray(memorySubmissions.id, parsed.data.discardSubmissionIds),
        ),
      );
    if (
      candidates.length !== parsed.data.discardSubmissionIds.length ||
      candidates.some(
        (item) => item.status !== "uploading" || item.mediaAssetId !== null,
      )
    ) {
      throw new ContributionError("Only unfinished photos can be discarded.", 409);
    }
    await deleteUnfinishedContributionBlobs(
      batchId,
      candidates.map((item) => item.id),
    );
    await database
      .delete(memorySubmissions)
      .where(
        and(
          eq(memorySubmissions.batchId, batchId),
          inArray(memorySubmissions.id, candidates.map((item) => item.id)),
        ),
      );
  }

  const remaining = await database
    .select({ status: memorySubmissions.status })
    .from(memorySubmissions)
    .where(eq(memorySubmissions.batchId, batchId));
  if (remaining.some((item) => item.status === "uploading")) {
    throw new ContributionError("Retry or discard the unfinished photos first.", 409);
  }

  const status = remaining.length > 0 ? "pending" : "abandoned";
  await database
    .update(submissionBatches)
    .set({
      expectedCount: remaining.length,
      status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(submissionBatches.id, batchId));
  return getContributionBatchStatus(batchId, parsed.data.editToken);
}
