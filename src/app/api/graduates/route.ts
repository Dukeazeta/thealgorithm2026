import { listPublishedGraduates } from "@/lib/content";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? undefined;
  const data = await listPublishedGraduates(search);
  return Response.json({ data });
}
