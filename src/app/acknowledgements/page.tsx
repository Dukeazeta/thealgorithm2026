import type { Metadata } from "next";
import { AcknowledgementsView } from "@/components/acknowledgements-view";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Acknowledgements | The Algorithm 2026",
  description:
    "A dedicated record of the people who helped the FUPRE Computer Science Class of 2026 reach graduation.",
};

export default function AcknowledgementsPage() {
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main id="main-content" className="w-full max-w-full overflow-x-hidden">
        <AcknowledgementsView />
      </main>
      <SiteFooter />
    </div>
  );
}
