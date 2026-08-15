import { listPublishedGallery } from "@/lib/content";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const featured = url.searchParams.get("featured");
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const offset = Number(url.searchParams.get("offset") ?? "0");
  const result = await listPublishedGallery({
    category: url.searchParams.get("category") ?? undefined,
    featured: featured === null ? undefined : featured === "true",
    limit: Number.isFinite(limit) ? limit : 50,
    offset: Number.isFinite(offset) ? offset : 0,
  });
  return Response.json(result);
}
