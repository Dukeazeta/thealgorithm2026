import { requireAdmin } from "@/lib/auth";
import { uploadPublicImage } from "@/lib/blob";
import { getDatabase } from "@/db/client";
import { mediaAssets } from "@/db/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Choose an image first." }, { status: 400 });
    }

    const uploaded = await uploadPublicImage(file, "archive");
    const id = crypto.randomUUID();
    await getDatabase().insert(mediaAssets).values({
      id,
      blobUrl: uploaded.url,
      blobPathname: uploaded.pathname,
      mimeType: uploaded.contentType,
      byteSize: uploaded.byteSize,
      altText: file.name,
    });

    return Response.json({ data: { id, url: uploaded.url } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    const status = message === "Unauthorized" ? 401 : 400;
    return Response.json({ error: message }, { status });
  }
}
