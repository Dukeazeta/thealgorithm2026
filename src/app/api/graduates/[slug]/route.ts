import { getPublishedGraduate } from "@/lib/content";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const graduate = await getPublishedGraduate(slug);
  if (!graduate) return Response.json({ error: "Graduate not found" }, { status: 404 });
  return Response.json({ data: graduate });
}
