import Link from "next/link";
import { AdminMotion } from "@/components/admin/admin-motion";
import { getDashboardSnapshot } from "@/lib/content";

const cards = [
  { key: "graduates", label: "Graduates", href: "/admin/graduates", className: "col-span-12 md:col-span-4" },
  { key: "gallery", label: "Gallery frames", href: "/admin/gallery", className: "col-span-12 md:col-span-4" },
  { key: "chapters", label: "Story chapters", href: "/admin/story", className: "col-span-12 md:col-span-4" },
] as const;

export default async function AdminDashboardPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <AdminMotion />
      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-36">
        <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-[#d7ff5a]/10 blur-3xl" />
        <div className="mx-auto grid max-w-[96rem] gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8" data-admin-reveal>
            <p className="text-xs font-medium tracking-[0.2em] text-[#d7ff5a] uppercase">Archive console</p>
            <h1 className="mt-5 max-w-6xl text-[clamp(3rem,6.1vw,7.25rem)] leading-[0.9] font-medium tracking-[-0.08em]">
              The record is ready for its next keeper.
            </h1>
          </div>
          <p className="max-w-md text-base leading-7 text-white/50 lg:col-span-4 lg:pb-2" data-admin-reveal>
            Shape the public archive through a single editorial workspace. Draft carefully, review openly, publish deliberately.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-36" data-admin-pin>
        <div className="mx-auto grid max-w-[96rem] gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4" data-admin-pin-panel>
            <p className="text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">Current archive state</p>
            <h2 className="mt-4 max-w-lg text-4xl font-medium tracking-[-0.06em] sm:text-5xl">A small system with a long memory.</h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/50">The public site only receives content after it has earned its place here.</p>
            <Link href="/admin/submissions" className="mt-8 inline-flex h-11 items-center rounded-full bg-[#d7ff5a] px-5 text-sm font-bold text-[#0b0d0d] transition-transform hover:-translate-y-0.5">Review memories</Link>
          </div>
          <div className="grid grid-flow-dense grid-cols-12 gap-3 lg:col-span-8" data-admin-reveal>
            {cards.map((card) => (
              <Link key={card.key} href={card.href} className={`${card.className} group rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-6 transition-transform duration-700 hover:-translate-y-1 hover:bg-white/[0.09] sm:p-8`}>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-semibold tracking-[0.16em] text-white/45 uppercase">{card.label}</span>
                  <span className="text-[#d7ff5a] transition-transform duration-500 group-hover:translate-x-1">↗</span>
                </div>
                <p className="mt-12 text-5xl font-medium tracking-[-0.07em] text-[#d7ff5a]">{snapshot[card.key]}</p>
                <p className="mt-3 text-sm text-white/45">Total records in the archive database.</p>
              </Link>
            ))}
            <Link href="/admin/submissions" className="group col-span-12 rounded-[1.5rem] bg-[#f2f0e8] p-6 text-[#0b0d0d] transition-transform duration-700 hover:-translate-y-1 sm:p-8 md:col-span-6">
              <div className="flex items-start justify-between gap-4"><span className="text-xs font-bold tracking-[0.16em] uppercase">Needs review</span><span className="text-xl transition-transform duration-500 group-hover:translate-x-1">→</span></div>
              <p className="mt-12 text-6xl font-medium tracking-[-0.08em]">{snapshot.pendingSubmissions}</p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-black/55">Public memories waiting for an editorial decision.</p>
            </Link>
            <div className="col-span-12 rounded-[1.5rem] border border-[#d7ff5a]/30 bg-[#d7ff5a]/10 p-6 sm:p-8 md:col-span-6">
              <p className="text-xs font-bold tracking-[0.16em] text-[#d7ff5a] uppercase">Publishing rhythm</p>
              <p className="mt-6 max-w-xs text-2xl leading-tight font-medium tracking-[-0.05em]">Every approved frame makes the archive more complete.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[96rem] flex-col justify-between gap-6 text-sm text-white/45 sm:flex-row"><span>The Algorithm 26 / CMS</span><span>FUPRE Computer Science archive</span></div>
      </footer>
    </main>
  );
}
