import { reviewSubmissionAction } from "@/app/admin/actions";
import { listPendingSubmissions } from "@/lib/content";

export default async function AdminSubmissionsPage() {
  const submissions = await listPendingSubmissions();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#0b0d0d] text-white">
      {/* Hero Section */}
      <section className="border-b border-white/5 px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="mb-4 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-white/30 uppercase">
                <span className="h-1.5 w-1.5 bg-white/40" />
                Editorial queue
              </div>
              <h1 className="mt-5 max-w-6xl text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] font-medium tracking-tighter text-white">
                Memories looking for a home.
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/40 lg:col-span-4 lg:pb-2">
              Review each contribution with its context intact. Approving an image-backed memory publishes it to the gallery.
            </p>
          </div>
        </div>
      </section>

      {/* Queue Section */}
      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[96rem]">
          
          {submissions.length === 0 ? (
            <div className="border border-dashed border-white/10 bg-[#101212] px-6 py-32 text-center">
              <p className="text-2xl font-medium tracking-tight text-white">The queue is clear.</p>
              <p className="mt-3 text-sm text-white/40">New public memories will appear here when they arrive.</p>
            </div>
          ) : (
            <div className="grid gap-px bg-white/5 md:grid-cols-2 lg:grid-cols-2">
              {submissions.map((submission) => (
                <article key={submission.id} className="flex flex-col bg-[#0b0d0d]">
                  
                  {/* Media Block (Sharp, no rounded corners) */}
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#101212]">
                    {submission.imageSrc ? (
                      <div 
                        className="absolute inset-0 bg-cover bg-center grayscale transition-transform duration-1000 hover:scale-105 hover:grayscale-0" 
                        style={{ backgroundImage: `url(${submission.imageSrc})` }} 
                        aria-label={submission.title} 
                        role="img" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-xs uppercase tracking-wide text-white/30">
                        Text-only memory
                      </div>
                    )}
                  </div>

                  {/* Content & Action Block */}
                  <div className="flex flex-1 flex-col p-8 lg:p-10">
                    <div className="flex items-center justify-between gap-4 text-[0.65rem] font-bold tracking-[0.16em] text-white/40 uppercase">
                      <span>{submission.category}</span>
                      <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h2 className="mt-6 text-2xl font-medium tracking-tight text-white">
                      {submission.title}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-white/60">
                      {submission.caption}
                    </p>
                    <p className="mt-8 text-[0.7rem] uppercase tracking-wide text-white/30">
                      Submitted by {submission.contributorName}
                    </p>

                    <div className="mt-auto pt-8">
                      <form action={reviewSubmissionAction} className="space-y-4 border-t border-white/10 pt-6">
                        <input type="hidden" name="submissionId" value={submission.id} />
                        
                        <label className="flex flex-col gap-2">
                          <span className="text-[0.65rem] font-bold tracking-widest text-white/40 uppercase">Review Notes</span>
                          <textarea 
                            name="reviewNotes" 
                            rows={2} 
                            placeholder="Optional editorial feedback" 
                            className="w-full border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white" 
                          />
                        </label>
                        
                        <div className="flex gap-4">
                          <button 
                            name="decision" 
                            value="approved" 
                            type="submit" 
                            className="h-11 flex-1 bg-white px-4 text-[0.7rem] font-bold tracking-wide text-zinc-900 uppercase transition-transform hover:bg-white/90 active:scale-[0.98]"
                          >
                            Approve
                          </button>
                          <button 
                            name="decision" 
                            value="rejected" 
                            type="submit" 
                            className="h-11 flex-1 border border-white/10 bg-transparent px-4 text-[0.7rem] font-bold tracking-wide text-white uppercase transition-colors hover:border-red-500/50 hover:text-red-300"
                          >
                            Reject
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
