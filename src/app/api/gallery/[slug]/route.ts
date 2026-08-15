import { getPublishedGalleryItem } from "@/lib/content";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const galleryItem = await getPublishedGalleryItem(slug);
  if (!galleryItem) return Response.json({ error: "Gallery item not found" }, { status: 404 });
  return Response.json({ data: galleryItem });
}
