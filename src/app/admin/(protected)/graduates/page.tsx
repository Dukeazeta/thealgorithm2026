import { GraduateEditor } from "@/components/admin/editor-forms";
import { listAllGraduates } from "@/lib/content";

export default async function AdminGraduatesPage() {
  const graduates = await listAllGraduates();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#0b0d0d] text-white">
      {/* Hero Section */}
      <section className="border-b border-white/5 px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="mb-4 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-white/30 uppercase">
                <span className="h-1.5 w-1.5 bg-white/40" />
                People directory
              </div>
              <h1 className="mt-5 max-w-6xl text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] font-medium tracking-tighter text-white">
                Give every face a proper record.
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/40 lg:col-span-4 lg:pb-2">
              Create a profile, attach a portrait from Blob, and publish it when the details are ready.
            </p>
          </div>
        </div>
      </section>

      {/* Editor & Records Section */}
      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-16 lg:grid-cols-12">
            
            {/* Editor Column */}
            <div className="lg:col-span-7">
              <div className="mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-medium tracking-tight">New profile</h2>
                <p className="mt-2 text-[0.7rem] uppercase tracking-wide text-white/40">Save as draft first, then publish</p>
              </div>
              <GraduateEditor />
            </div>

            {/* Existing Records Column */}
            <aside className="lg:col-span-5">
              <div className="mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-medium tracking-tight">Existing records</h2>
                <p className="mt-2 text-[0.7rem] uppercase tracking-wide text-white/40">All registered graduates</p>
              </div>

              <div className="flex flex-col divide-y divide-white/5">
                {graduates.length === 0 ? (
                  <div className="border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-[0.7rem] uppercase tracking-wide text-white/40">
                    No graduate profiles yet.
                  </div>
                ) : (
                  graduates.map((graduate) => (
                    <div key={graduate.id} className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-white/[0.02] px-4 -mx-4">
                      <div>
                        <p className="font-medium text-white">{graduate.name}</p>
                        <p className="mt-1 text-xs text-white/40">{graduate.slug}</p>
                      </div>
                      <span className="border border-white/10 px-3 py-1 text-[0.6rem] font-bold tracking-wider text-white/50 uppercase">
                        {graduate.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </aside>
            
          </div>
        </div>
      </section>
    </main>
  );
}
