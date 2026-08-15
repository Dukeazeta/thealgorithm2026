import { getPublishedStory } from "@/lib/content";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ data: await getPublishedStory() });
}
