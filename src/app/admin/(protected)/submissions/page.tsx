import { reviewSubmissionBatchAction } from "@/app/admin/actions";
import { listPendingSubmissionBatches } from "@/lib/content";

export default async function AdminSubmissionsPage() {
  const batches = await listPendingSubmissionBatches();

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#0b0d0d] text-white">
      <section className="border-b border-white/5 px-5 py-14 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-[96rem]">
          <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-white/30 uppercase">Editorial queue · {batches.length} batches</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h1 className="max-w-5xl text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] font-medium tracking-tighter lg:col-span-8">Memories looking for a home.</h1>
            <p className="max-w-md text-sm leading-6 text-white/40 lg:col-span-4">Each contributor batch stays together. Uncheck any frame you want to leave for a later review.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-10 sm:py-14 lg:px-16">
        <div className="mx-auto max-w-[96rem] space-y-8">
          {batches.length === 0 ? (
            <div className="border border-dashed border-white/10 bg-[#101212] px-6 py-28 text-center">
              <p className="text-2xl font-medium tracking-tight">The queue is clear.</p>
              <p className="mt-3 text-sm text-white/40">New public photo batches will appear here when they arrive.</p>
            </div>
          ) : batches.map((batch) => {
            const readyItems = batch.items.filter((item) => item.status === "pending" && item.imageSrc);
            const isReady = batch.status === "pending" || batch.status === "legacy";
            return (
              <article key={batch.id} className="border border-white/10 bg-[#101212]">
                <header className="grid gap-5 border-b border-white/10 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-[0.62rem] font-bold tracking-[0.16em] text-white/35 uppercase">
                      <span>{batch.category}</span>
                      <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
                      <span>{readyItems.length} of {batch.expectedCount} uploaded</span>
                      <span className={isReady ? "text-emerald-300/70" : "text-amber-300/70"}>{batch.status}</span>
                    </div>
                    <h2 className="mt-4 text-2xl font-medium tracking-tight sm:text-3xl">{batch.title}</h2>
                    {batch.caption && <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">{batch.caption}</p>}
                    <p className="mt-4 text-[0.68rem] tracking-wide text-white/30 uppercase">Submitted by {batch.contributorName}</p>
                  </div>
                  {!isReady && <p className="max-w-xs border border-amber-200/10 bg-amber-100/5 px-4 py-3 text-xs leading-5 text-amber-100/60">Uploads are still in progress. Review actions unlock when the batch is complete.</p>}
                </header>

                <form action={reviewSubmissionBatchAction}>
                  <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                    {batch.items.map((item) => (
                      <label key={item.id} className={`group relative aspect-[4/3] overflow-hidden bg-[#0b0d0d] ${item.status !== "pending" ? "pointer-events-none opacity-35" : "cursor-pointer"}`}>
                        {item.imageSrc ? <div role="img" aria-label={`${item.title}, photo ${item.ordinal ?? 1}`} className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.6), transparent 45%), url(${item.imageSrc})` }} /> : <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-[0.6rem] font-bold tracking-wide text-white/30 uppercase">Awaiting upload</div>}
                        {item.status === "pending" && <input type="checkbox" name="submissionIds" value={item.id} defaultChecked className="absolute top-3 right-3 h-5 w-5 accent-white" aria-label={`Select ${item.sourceFileName ?? item.title}`} />}
                        <span className="absolute inset-x-3 bottom-3 truncate text-[0.62rem] text-white/70">{item.sourceFileName ?? `Photo ${item.ordinal ?? 1}`}</span>
                      </label>
                    ))}
                  </div>

                  {isReady && readyItems.length > 0 && (
                    <footer className="grid gap-4 border-t border-white/10 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
                      <label className="block max-w-2xl">
                        <span className="text-[0.62rem] font-bold tracking-widest text-white/35 uppercase">Review notes (optional)</span>
                        <textarea name="reviewNotes" rows={2} placeholder="Applied to the selected photos" className="mt-2 w-full border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/50" />
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:min-w-80">
                        <button name="decision" value="approved" type="submit" className="min-h-12 bg-white px-5 text-[0.68rem] font-bold tracking-wide text-zinc-950 uppercase hover:bg-white/90">Approve selected</button>
                        <button name="decision" value="rejected" type="submit" className="min-h-12 border border-white/15 px-5 text-[0.68rem] font-bold tracking-wide uppercase hover:border-red-400/50 hover:text-red-200">Reject selected</button>
                      </div>
                    </footer>
                  )}
                </form>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
