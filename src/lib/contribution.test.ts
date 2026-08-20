import assert from "node:assert/strict";
import test from "node:test";
import {
  completeBatchSchema,
  contributionBatchSchema,
  isExpectedUploadPath,
  isFinalizedSubmission,
  moderationSelectionSchema,
  nextBatchUploadStatus,
  uploadPath,
} from "@/lib/contribution";
import {
  contributionTokenMatches,
  hashContributionToken,
} from "@/lib/contribution-server";
import { galleryItemSchema, memorySubmissionSchema } from "@/lib/validation";
import { createClientFileId } from "@/lib/contribution-client";

process.env.AUTH_SESSION_SECRET = "test-secret-that-is-long-enough-for-contributions";

function file(index: number) {
  return {
    clientFileId: crypto.randomUUID(),
    name: `photo-${index}.jpg`,
    type: "image/jpeg",
    size: 1024,
    lastModified: index,
  };
}

function batch(count: number, caption = "") {
  return {
    contributorName: "Test Contributor",
    category: "Class",
    title: "Final year memories",
    caption,
    files: Array.from({ length: count }, (_, index) => file(index)),
  };
}

test("accepts 200 files and rejects 201", () => {
  assert.equal(contributionBatchSchema.safeParse(batch(200)).success, true);
  assert.equal(contributionBatchSchema.safeParse(batch(201)).success, false);
});

test("creates UUID-compatible client file ids without randomUUID", () => {
  assert.match(createClientFileId(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("validates shared metadata and duplicate files", () => {
  assert.equal(
    contributionBatchSchema.safeParse({ ...batch(1), contributorName: "A" }).success,
    false,
  );
  const duplicate = file(1);
  assert.equal(
    contributionBatchSchema.safeParse({ ...batch(1), files: [duplicate, { ...duplicate, clientFileId: crypto.randomUUID() }] }).success,
    false,
  );
});

test("captions are optional for contributions, gallery items, and legacy submissions", () => {
  assert.equal(contributionBatchSchema.safeParse(batch(1)).success, true);
  assert.equal(memorySubmissionSchema.safeParse({ contributorName: "Ada Example", category: "Labs", title: "Lab day", caption: "" }).success, true);
  assert.equal(galleryItemSchema.safeParse({ slug: "lab-day", title: "Lab day", category: "Labs", year: "2026", location: "Class Archive", mediaAssetId: crypto.randomUUID(), alt: "Lab day", caption: "", tag: "Community Memory", featured: false, status: "published", sortOrder: 0 }).success, true);
});

test("batch edit tokens are hashed and compared without storing the raw token", () => {
  const token = "a-private-edit-token";
  const hash = hashContributionToken(token);
  assert.notEqual(hash, token);
  assert.equal(contributionTokenMatches(token, hash), true);
  assert.equal(contributionTokenMatches("wrong-token", hash), false);
});

test("upload authorization is scoped to the exact batch item path", () => {
  const batchId = crypto.randomUUID();
  const submissionId = crypto.randomUUID();
  assert.equal(isExpectedUploadPath(uploadPath(batchId, submissionId, "webp"), batchId, submissionId), true);
  assert.equal(isExpectedUploadPath(uploadPath(batchId, crypto.randomUUID(), "webp"), batchId, submissionId), false);
});

test("finalization and batch completion state helpers are idempotent", () => {
  assert.equal(isFinalizedSubmission("pending", crypto.randomUUID()), true);
  assert.equal(isFinalizedSubmission("uploading", null), false);
  assert.equal(nextBatchUploadStatus(["pending", "pending"]), "pending");
  assert.equal(nextBatchUploadStatus(["pending", "uploading"]), "uploading");
  assert.equal(nextBatchUploadStatus([]), "abandoned");
  assert.equal(completeBatchSchema.safeParse({ editToken: "x".repeat(32), discardSubmissionIds: [] }).success, true);
});

test("moderation selections require 1 to 200 unique photo ids", () => {
  const ids = Array.from({ length: 200 }, () => crypto.randomUUID());
  assert.equal(moderationSelectionSchema.safeParse(ids).success, true);
  assert.equal(moderationSelectionSchema.safeParse([...ids, crypto.randomUUID()]).success, false);
  assert.equal(moderationSelectionSchema.safeParse([ids[0], ids[0]]).success, false);
  assert.equal(moderationSelectionSchema.safeParse([]).success, false);
});
