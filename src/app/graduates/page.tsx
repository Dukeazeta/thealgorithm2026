import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { GraduatesView } from "@/components/graduates-view";
import { listPublishedGraduates } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Graduates | The Algorithm 2026",
  description:
    "Explore the student directory and graduation profile cards for the FUPRE Computer Science Class of 2026.",
};

export const dynamic = "force-dynamic";

export default async function GraduatesPage() {
  const graduates = await listPublishedGraduates();
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main id="main-content">
        <GraduatesView graduates={graduates} />
      </main>
      <SiteFooter />
    </div>
  );
}
