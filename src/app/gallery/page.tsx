import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { GalleryView } from "@/components/gallery-view";
import { listPublishedGallery } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Gallery | The Algorithm 2026",
  description:
    "The official photo archive and living memories of the FUPRE Computer Science Class of 2026.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const gallery = await listPublishedGallery();
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main id="main-content">
        <GalleryView items={gallery.data} nextOffset={gallery.nextOffset} />
      </main>
      <SiteFooter />
    </div>
  );
}
