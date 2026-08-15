import Link from "next/link";
import { AdminMotion } from "@/components/admin/admin-motion";
import { getDashboardSnapshot } from "@/lib/content";

const cards = [
  { key: "graduates", label: "Graduates", href: "/admin/graduates", desc: "Total profiles in the database." },
  { key: "gallery", label: "Gallery frames", href: "/admin/gallery", desc: "Photographs currently archived." },
  { key: "chapters", label: "Story chapters", href: "/admin/story", desc: "Written narrative milestones." },
] as const;

export default async function AdminDashboardPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#0b0d0d] text-white">
      <AdminMotion />
      
      {/* Hero Section - Left Aligned */}
      <section className="border-b border-white/5 px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[96rem]">
          <div className="max-w-4xl" data-admin-reveal>
            <div className="mb-4 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-white/30 uppercase">
              <span className="h-1.5 w-1.5 bg-white/40" />
              Archive console
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] font-medium tracking-tighter text-white">
              The record is ready for its next keeper.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/40">
              Shape the public archive through a single editorial workspace. Draft carefully, review openly, publish deliberately.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section - Asymmetric Grid */}
      <section className="px-6 py-16 sm:px-10 lg:px-16" data-admin-pin>
        <div className="mx-auto grid max-w-[96rem] grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Left Column: Context */}
          <div className="lg:col-span-4 lg:pr-8" data-admin-pin-panel>
            <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-white/30 uppercase">Current state</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">A system with a long memory.</h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">The public site only receives content after it has earned its place here.</p>
            <Link href="/admin/submissions" className="mt-6 inline-flex h-10 items-center justify-center border border-white px-6 text-[0.7rem] font-bold tracking-wide uppercase text-white transition-colors hover:bg-white hover:text-black active:scale-[0.98]">
              Review submissions
            </Link>
          </div>
          
          {/* Right Column: Metrics Grid */}
          <div className="lg:col-span-8" data-admin-reveal>
            <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-2">
              
              {/* Review Panel - Spans Full Row */}
              <Link href="/admin/submissions" className="group col-span-1 bg-[#101212] p-8 transition-colors hover:bg-[#151717] sm:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase text-white">Needs review</span>
                    <p className="mt-2 text-xs leading-6 text-white/40">Public memories waiting for an editorial decision.</p>
                  </div>
                  <span className="text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">→</span>
                </div>
                <div className="mt-12 text-6xl font-medium tracking-tighter text-white">
                  {snapshot.pendingSubmissions}
                </div>
              </Link>

              {/* Standard Stat Panels */}
              {cards.map((card) => (
                <Link key={card.key} href={card.href} className="group bg-[#0b0d0d] p-8 transition-colors hover:bg-[#101212]">
                  <div className="flex items-start justify-between">
                    <span className="text-[0.65rem] font-semibold tracking-[0.16em] uppercase text-white/40">{card.label}</span>
                    <span className="text-white/20 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white">↗</span>
                  </div>
                  <div className="mt-10 text-4xl font-medium tracking-tighter text-white">
                    {snapshot[card.key]}
                  </div>
                  <p className="mt-2 text-xs text-white/30">{card.desc}</p>
                </Link>
              ))}

              <div className="bg-[#0b0d0d] p-8">
                <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase text-white/40">Publishing</span>
                <p className="mt-10 text-lg leading-tight font-medium tracking-tight text-white/70">
                  Every approved frame makes the archive more complete.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[96rem] flex-col justify-between gap-6 text-[0.7rem] uppercase tracking-wide text-white/30 sm:flex-row">
          <span>The Algorithm 26 / CMS</span>
          <span>FUPRE Computer Science archive</span>
        </div>
      </footer>
    </main>
  );
}
