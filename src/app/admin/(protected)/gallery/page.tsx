import { GalleryEditor } from "@/components/admin/editor-forms";
import { listAllGalleryItems } from "@/lib/content";

export default async function AdminGalleryPage() {
  const gallery = await listAllGalleryItems();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#0b0d0d] text-white">
      {/* Hero Section */}
      <section className="border-b border-white/5 px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="mb-4 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-white/30 uppercase">
                <span className="h-1.5 w-1.5 bg-white/40" />
                Living gallery
              </div>
              <h1 className="mt-5 max-w-6xl text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] font-medium tracking-tighter text-white">
                Build the visual memory.
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-white/40 lg:col-span-4 lg:pb-2">
              Upload an image, give it context, and decide whether the class should see it now or later.
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
                <h2 className="text-2xl font-medium tracking-tight">New gallery frame</h2>
                <p className="mt-2 text-[0.7rem] uppercase tracking-wide text-white/40">An image is required before saving</p>
              </div>
              <GalleryEditor />
            </div>

            {/* Existing Records Column */}
            <aside className="lg:col-span-5">
              <div className="mb-8 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-medium tracking-tight">Existing frames</h2>
                <p className="mt-2 text-[0.7rem] uppercase tracking-wide text-white/40">All saved photographs</p>
              </div>

              <div className="grid gap-px bg-white/5">
                {gallery.length === 0 ? (
                  <div className="bg-[#0b0d0d] p-8 text-center text-[0.7rem] uppercase tracking-wide text-white/40">
                    No gallery frames yet.
                  </div>
                ) : (
                  gallery.map(({ gallery: item, imageUrl }) => (
                    <div key={item.id} className="group flex items-center gap-4 bg-[#0b0d0d] p-4 transition-colors hover:bg-[#101212]">
                      <div 
                        className="h-16 w-20 shrink-0 bg-white/5 bg-cover bg-center grayscale transition-all duration-700 group-hover:grayscale-0"
                        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined} 
                      />
                      <div className="min-w-0 flex-1 py-1">
                        <p className="truncate font-medium text-white">{item.title}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[0.6rem] font-bold tracking-wider text-white/40 uppercase">{item.category}</span>
                          <span className="text-white/20">•</span>
                          <span className="text-[0.6rem] font-bold tracking-wider text-white/40 uppercase">{item.status}</span>
                        </div>
                      </div>
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
