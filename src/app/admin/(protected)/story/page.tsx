import { StoryChapterEditor, StoryMemoryEditor, StoryStatEditor } from "@/components/admin/editor-forms";
import { listAllStoryContent } from "@/lib/content";

export default async function AdminStoryPage() {
  const [chapters, memories, stats] = await listAllStoryContent();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#0b0d0d] text-white">
      {/* Hero Section */}
      <section className="border-b border-white/5 px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="mb-4 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-white/30 uppercase">
                <span className="h-1.5 w-1.5 bg-white/40" />
                Editorial chronicle
              </div>
              <h1 className="mt-5 max-w-6xl text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] font-medium tracking-tighter text-white">
                Shape the story behind the frames.
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/40 lg:col-span-4 lg:pb-2">
              Chapters, inside lore, and the numbers that make four years legible.
            </p>
          </div>
        </div>
      </section>

      {/* Chapters Editor & Records */}
      <section className="border-b border-white/5 px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-16 lg:grid-cols-12">
            
            <div className="lg:col-span-7">
              <div className="mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-medium tracking-tight">New chapter</h2>
                <p className="mt-2 text-[0.7rem] uppercase tracking-wide text-white/40">Narrative milestone</p>
              </div>
              <StoryChapterEditor />
            </div>

            <aside className="lg:col-span-5">
              <div className="mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-medium tracking-tight">Existing chapters</h2>
                <p className="mt-2 text-[0.7rem] uppercase tracking-wide text-white/40">Chronological history</p>
              </div>

              <div className="flex flex-col divide-y divide-white/5">
                {chapters.length === 0 ? (
                  <div className="border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-[0.7rem] uppercase tracking-wide text-white/40">
                    No chapters yet.
                  </div>
                ) : (
                  chapters.map((chapter) => (
                    <div key={chapter.id} className="group flex flex-col gap-2 py-5 transition-colors hover:bg-white/[0.02] px-4 -mx-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-white">{chapter.title}</p>
                        <span className="border border-white/10 px-3 py-1 text-[0.6rem] font-bold tracking-wider text-white/50 uppercase">
                          {chapter.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">{chapter.level} · {chapter.year}</p>
                    </div>
                  ))
                )}
              </div>
            </aside>
            
          </div>
        </div>
      </section>

      {/* Minor Editors (Memory & Stat) */}
      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-16 lg:grid-cols-2">
            
            <div>
              <div className="mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-medium tracking-tight">Class memory</h2>
                <p className="mt-2 text-[0.7rem] uppercase tracking-wide text-white/40">Add the lore between milestones</p>
              </div>
              <StoryMemoryEditor />
            </div>

            <div>
              <div className="mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-medium tracking-tight">Class statistic</h2>
                <p className="mt-2 text-[0.7rem] uppercase tracking-wide text-white/40">Small facts, carefully framed</p>
              </div>
              <StoryStatEditor />
            </div>

          </div>

          {/* Render minor data in bento blocks */}
          <div className="mt-16 grid gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
            {memories.map((memory) => (
              <div key={memory.id} className="bg-[#0b0d0d] p-6 transition-colors hover:bg-[#101212]">
                <p className="text-[0.65rem] font-bold tracking-wider text-white/40 uppercase">{memory.category}</p>
                <p className="mt-4 font-medium leading-relaxed text-white">{memory.title}</p>
              </div>
            ))}
            {stats.map((stat) => (
              <div key={stat.id} className="bg-[#101212] p-6 transition-colors hover:bg-[#151717]">
                <p className="text-5xl font-medium tracking-tighter text-white">{stat.value}</p>
                <p className="mt-4 text-[0.65rem] font-bold tracking-wider text-white/40 uppercase">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </main>
  );
}
