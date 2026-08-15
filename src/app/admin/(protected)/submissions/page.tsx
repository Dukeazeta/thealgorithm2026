import { reviewSubmissionAction } from "@/app/admin/actions";
import { listPendingSubmissions } from "@/lib/content";

export default async function AdminSubmissionsPage() {
  const submissions = await listPendingSubmissions();

  return (
    <main className="w-full max-w-full overflow-x-hidden px-5 py-20 sm:px-10 sm:py-28 lg:px-16 lg:py-36">
      <div className="mx-auto max-w-[96rem]">
        <div className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8"><p className="text-xs font-semibold tracking-[0.18em] text-[#d7ff5a] uppercase">Editorial queue</p><h1 className="mt-5 max-w-6xl text-[clamp(3rem,5vw,6rem)] leading-[0.9] font-medium tracking-[-0.075em]">Memories looking for a home.</h1></div>
          <p className="max-w-md text-sm leading-7 text-white/50 lg:col-span-4">Review each contribution with its context intact. Approving an image-backed memory publishes it to the gallery.</p>
        </div>

        {submissions.length === 0 ? (
          <div className="mt-14 rounded-[2rem] border border-dashed border-white/15 bg-white/[0.035] px-6 py-20 text-center"><p className="text-2xl font-medium tracking-[-0.04em]">The queue is clear.</p><p className="mt-3 text-sm text-white/45">New public memories will appear here when they arrive.</p></div>
        ) : (
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {submissions.map((submission) => (
              <article key={submission.id} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] transition-transform duration-700 hover:-translate-y-1">
                <div className="relative aspect-[16/10] overflow-hidden bg-black/20">
                  {submission.imageSrc ? <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${submission.imageSrc})` }} aria-label={submission.title} role="img" /> : <div className="absolute inset-0 flex items-center justify-center bg-[#d7ff5a]/10 px-8 text-center text-sm text-white/50">Text-only memory</div>}
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4 text-xs font-semibold tracking-[0.14em] text-white/40 uppercase"><span>{submission.category}</span><span>{new Date(submission.createdAt).toLocaleDateString()}</span></div>
                  <h2 className="mt-4 text-2xl font-medium tracking-[-0.05em]">{submission.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/60">{submission.caption}</p>
                  <p className="mt-5 text-xs text-[#d7ff5a]">Submitted by {submission.contributorName}</p>
                  <form action={reviewSubmissionAction} className="mt-7 space-y-3 border-t border-white/10 pt-5">
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <textarea name="reviewNotes" rows={2} placeholder="Optional review note" className="w-full rounded-xl border border-white/12 bg-black/20 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#d7ff5a]/70" />
                    <div className="flex gap-3"><button name="decision" value="approved" type="submit" className="h-11 flex-1 rounded-xl bg-[#d7ff5a] px-4 text-xs font-bold text-[#0b0d0d] transition-transform hover:-translate-y-0.5">Approve memory</button><button name="decision" value="rejected" type="submit" className="h-11 flex-1 rounded-xl border border-white/15 px-4 text-xs font-bold text-white transition-colors hover:border-red-300/60 hover:text-red-100">Reject memory</button></div>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
