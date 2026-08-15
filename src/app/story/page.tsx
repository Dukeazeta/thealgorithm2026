import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { StoryView } from "@/components/story-view";

export const metadata: Metadata = {
  title: "The Story | The Algorithm 2026",
  description:
    "The 4-year chronicle of the FUPRE Computer Science Class of 2026 — from 100 Level orientation to final capstone defence.",
};

export default function StoryPage() {
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main id="main-content">
        <StoryView />
      </main>
      <SiteFooter />
    </div>
  );
}
