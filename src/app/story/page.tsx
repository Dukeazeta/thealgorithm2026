import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { StoryView } from "@/components/story-view";
import { getPublishedStory } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Story | The Algorithm 2026",
  description:
    "The 4-year chronicle of the FUPRE Computer Science Class of 2026 — from 100 Level orientation to final capstone defence.",
};

export const dynamic = "force-dynamic";

export default async function StoryPage() {
  const story = await getPublishedStory();
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main id="main-content">
        <StoryView data={story} />
      </main>
      <SiteFooter />
    </div>
  );
}
