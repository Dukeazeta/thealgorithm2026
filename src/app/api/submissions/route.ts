import { getDatabase } from "@/db/client";
import { mediaAssets, memorySubmissions } from "@/db/schema";
import { deletePublicImage, uploadPublicImage } from "@/lib/blob";
import { eq } from "drizzle-orm";
import { memorySubmissionSchema } from "@/lib/validation";
import { consumeRateLimit, getRequestFingerprint } from "@/lib/rate-limit";

export const runtime = "nodejs";

function getClientAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request) {
  const limit = await consumeRateLimit(
    "memory-submission",
    getRequestFingerprint(getClientAddress(request)),
    5,
    60 * 60 * 1000,
  );
  if (!limit.allowed) {
    return Response.json(
      { error: "Too many submissions. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const formData = await request.formData();
  const parsed = memorySubmissionSchema.safeParse({
    contributorName: formData.get("contributorName"),
    category: formData.get("category"),
    title: formData.get("title"),
    caption: formData.get("caption"),
  });

  if (!parsed.success) {
    return Response.json(
      { error: "Please check the submission fields.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const imageValue = formData.get("image");
  if (imageValue !== null && !(imageValue instanceof File)) {
    return Response.json({ error: "The uploaded image is invalid." }, { status: 400 });
  }

  let uploadedImage: Awaited<ReturnType<typeof uploadPublicImage>> | null = null;
  if (imageValue instanceof File && imageValue.size > 0) {
    try {
      uploadedImage = await uploadPublicImage(imageValue, "submissions");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";
      return Response.json({ error: message }, { status: 400 });
    }
  }

  const database = getDatabase();
  const mediaId = uploadedImage ? crypto.randomUUID() : null;
  try {
    if (uploadedImage && mediaId) {
      await database.insert(mediaAssets).values({
        id: mediaId,
        blobUrl: uploadedImage.url,
        blobPathname: uploadedImage.pathname,
        mimeType: uploadedImage.contentType,
        byteSize: uploadedImage.byteSize,
        altText: parsed.data.title,
      });
    }

    const submissionId = crypto.randomUUID();
    await database.insert(memorySubmissions).values({
      id: submissionId,
      contributorName: parsed.data.contributorName,
      category: parsed.data.category,
      title: parsed.data.title,
      caption: parsed.data.caption,
      mediaAssetId: mediaId,
      status: "pending",
    });

    return Response.json({ data: { id: submissionId, status: "pending" } }, { status: 201 });
  } catch {
    if (uploadedImage) {
      await deletePublicImage(uploadedImage.pathname).catch(() => undefined);
      if (mediaId) {
        await database.delete(mediaAssets).where(eq(mediaAssets.id, mediaId)).catch(() => undefined);
      }
    }
    return Response.json({ error: "We could not save this memory. Please try again." }, { status: 500 });
  }
}
