import { del, put } from "@vercel/blob";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function validateImageFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new Error("Only JPEG, PNG, and WebP images are supported.");
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be smaller than 10 MB.");
  }
}

export async function uploadPublicImage(file: File, folder: string) {
  validateImageFile(file);

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const result = await put(`${folder}/${crypto.randomUUID()}.${extension}`, file, {
    access: "public",
    token,
    addRandomSuffix: false,
    contentType: file.type,
  });

  return {
    url: result.url,
    pathname: result.pathname,
    contentType: file.type,
    byteSize: file.size,
  };
}

export async function deletePublicImage(pathname: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  await del(pathname, { token });
}

export async function deletePublicImages(pathnames: string[]) {
  if (pathnames.length === 0) return;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  await del(pathnames, { token });
}
