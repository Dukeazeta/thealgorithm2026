import { z } from "zod";
import { galleryCategories } from "@/db/schema";

export const MAX_BATCH_FILES = 200;
export const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 2560;
export const CONTRIBUTION_SESSION_KEY = "algorithm26-contribution-batch";

export const SOURCE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

const contributionCategorySchema = z.enum(galleryCategories);

const SOURCE_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif"];

export const optionalCaptionSchema = z.preprocess(
  (value) => (value == null ? "" : value),
  z.string().trim().max(5000),
);

export const contributionFileSchema = z
  .object({
    clientFileId: z.string().uuid(),
    name: z.string().trim().min(1).max(255),
    type: z.string().max(100),
    size: z.number().int().positive().max(MAX_SOURCE_IMAGE_BYTES),
    lastModified: z.number().int().nonnegative(),
  })
  .refine(
    (file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      return (
        SOURCE_IMAGE_TYPES.includes(file.type as (typeof SOURCE_IMAGE_TYPES)[number]) ||
        SOURCE_IMAGE_EXTENSIONS.includes(extension)
      );
    },
    { message: "Only JPEG, PNG, WebP, HEIC, and HEIF images are supported." },
  );

export const contributionBatchSchema = z
  .object({
    contributorName: z.string().trim().min(2).max(80),
    category: contributionCategorySchema,
    title: z.string().trim().min(2).max(160),
    caption: optionalCaptionSchema,
    files: z.array(contributionFileSchema).min(1).max(MAX_BATCH_FILES),
  })
  .superRefine((batch, context) => {
    const ids = new Set<string>();
    const fingerprints = new Set<string>();

    batch.files.forEach((file, index) => {
      const fingerprint = fileFingerprint(file);
      if (ids.has(file.clientFileId) || fingerprints.has(fingerprint)) {
        context.addIssue({
          code: "custom",
          path: ["files", index],
          message: "Duplicate photos are not allowed in one batch.",
        });
      }
      ids.add(file.clientFileId);
      fingerprints.add(fingerprint);
    });
  });

export const contributionCredentialsSchema = z.object({
  batchId: z.string().uuid(),
  editToken: z.string().min(32).max(200),
});

export const uploadTokenPayloadSchema = contributionCredentialsSchema.extend({
  submissionId: z.string().uuid(),
});

export const finalizeUploadSchema = z.object({
  editToken: z.string().min(32).max(200),
  blob: z.object({
    url: z.string().url(),
    pathname: z.string().min(1).max(500),
    contentType: z.enum(["image/webp", "image/jpeg"]),
  }),
});

export const completeBatchSchema = z.object({
  editToken: z.string().min(32).max(200),
  discardSubmissionIds: z.array(z.string().uuid()).max(MAX_BATCH_FILES).default([]),
});

export const moderationSelectionSchema = z
  .array(z.string().uuid())
  .min(1)
  .max(MAX_BATCH_FILES)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Each selected photo must be unique.",
  });

export function fileFingerprint(file: {
  name: string;
  size: number;
  lastModified: number;
}) {
  return `${file.name.toLowerCase()}::${file.size}::${file.lastModified}`;
}

export function uploadPath(
  batchId: string,
  submissionId: string,
  extension: "webp" | "jpg",
) {
  return `submissions/${batchId}/${submissionId}.${extension}`;
}

export function isExpectedUploadPath(
  pathname: string,
  batchId: string,
  submissionId: string,
) {
  return (
    pathname === uploadPath(batchId, submissionId, "webp") ||
    pathname === uploadPath(batchId, submissionId, "jpg")
  );
}

export function nextBatchUploadStatus(statuses: string[]) {
  if (statuses.length === 0) return "abandoned" as const;
  return statuses.every((status) => status !== "uploading")
    ? ("pending" as const)
    : ("uploading" as const);
}

export function isFinalizedSubmission(
  status: string,
  mediaAssetId: string | null,
) {
  return status !== "uploading" && Boolean(mediaAssetId);
}

export type ContributionBatchInput = z.infer<typeof contributionBatchSchema>;
export type ContributionFileInput = z.infer<typeof contributionFileSchema>;
