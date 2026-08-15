import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { GalleryView } from "@/components/gallery-view";

export const metadata: Metadata = {
  title: "The Gallery | The Algorithm 2026",
  description:
    "The official photo archive and living memories of the FUPRE Computer Science Class of 2026.",
};

export default function GalleryPage() {
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main id="main-content">
        <GalleryView />
      </main>
      <SiteFooter />
    </div>
  );
}
