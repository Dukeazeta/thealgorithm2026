import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/home-sections";
import { GraduatesView } from "@/components/graduates-view";

export const metadata: Metadata = {
  title: "The Graduates | The Algorithm 2026",
  description:
    "Explore the student directory and graduation profile cards for the FUPRE Computer Science Class of 2026.",
};

export default function GraduatesPage() {
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main id="main-content">
        <GraduatesView />
      </main>
      <SiteFooter />
    </div>
  );
}
