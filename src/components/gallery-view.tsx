"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

type GalleryItem = {
  id: string;
  title: string;
  category: "Class" | "Campus" | "Labs" | "Celebrations";
  year: string;
  location: string;
  imageSrc: string;
  alt: string;
  caption: string;
  tag: string;
  featured?: boolean;
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "class-portrait-2026",
    title: "The Algorithm: Class of 2026 Official Portrait",
    category: "Class",
    year: "2026",
    location: "College of Science Quad, FUPRE",
    imageSrc: "/images/hero-bg.webp",
    alt: "The Algorithm Class of 2026 assembled in front of the College of Science building",
    caption:
      "The complete graduating class gathered under the morning sky in front of the College of Science. A definitive visual testament to four years of perseverance, collaboration, and shared triumph.",
    tag: "Official Record",
    featured: true,
  },
  {
    id: "college-of-science-dusk",
    title: "College of Science at Dusk",
    category: "Campus",
    year: "2026",
    location: "Faculty Plaza",
    imageSrc: "/images/hero-bg.webp",
    alt: "The College of Science building and surroundings",
    caption:
      "The heart of our academic journey. The halls where our first C programming lectures were held and where our final capstone presentations concluded.",
    tag: "Landmark",
  },
  {
    id: "nacos-departmental-crest",
    title: "NACOS FUPRE Departmental Crest",
    category: "Class",
    year: "2026",
    location: "Department of Computer Science",
    imageSrc: "/images/nacos-logo.jpg",
    alt: "NACOS Departmental crest logo",
    caption:
      "The official emblem of the Nigeria Association of Computer Science Students (NACOS), FUPRE Chapter — uniting generations of tech talent.",
    tag: "Insignia",
  },
  {
    id: "first-frame-archive",
    title: "The Assembly: Wide Lens Archive",
    category: "Class",
    year: "2026",
    location: "Science Complex",
    imageSrc: "/images/hero-bg.webp",
    alt: "Wide shot of the graduating class",
    caption:
      "Captured from the quadrangle pavement, capturing every group, friend circle, and student leader who shaped the Class of 2026.",
    tag: "Archive",
  },
];

const CATEGORIES = ["All", "Class", "Campus", "Labs", "Celebrations"] as const;

export function GalleryView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Keyboard accessibility for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveItem(null);
        setIsSubmitModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems =
    selectedCategory === "All"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div className="bg-[#efeee8] text-foreground">
      {/* Gallery Header */}
      <section className="relative overflow-hidden bg-white px-4 pt-16 pb-16 sm:px-6 sm:pt-24 sm:pb-24 lg:px-8 lg:pt-32 lg:pb-28">
        <div className="mx-auto max-w-[96rem]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[0.68rem] font-medium tracking-[0.2em] text-muted uppercase">
                The Living Archive · Class of 2026
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.75rem,1.8rem+5vw,6.5rem)] leading-[0.94] font-medium tracking-[-0.055em] text-balance text-foreground">
                The moments we get to keep.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">
                The visual repository of our passage through FUPRE. Every photograph,
                landmark, and celebration preserved with context.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSubmitModalOpen(true);
                setSubmissionSuccess(false);
              }}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#123f31] px-6 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#185341] focus-visible:outline-offset-2"
            >
              + Contribute a Memory
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-black/10 pt-6">
            <span className="mr-2 text-xs font-medium text-muted">Filter:</span>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-foreground text-white"
                      : "bg-black/5 text-foreground/70 hover:bg-black/10 hover:text-foreground"
                  }`}
                >
                  {category === "All" ? "All Moments" : category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Primary Hero Image Frame */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[96rem]">
          <div
            onClick={() => setActiveItem(GALLERY_ITEMS[0])}
            className="group relative min-h-[28rem] cursor-pointer overflow-hidden rounded-[2rem] bg-black sm:min-h-[38rem] lg:min-h-[48rem]"
          >
            <Image
              src="/images/hero-bg.webp"
              alt="The Algorithm Class of 2026 group in front of the College of Science building"
              fill
              priority
              sizes="(max-width: 1536px) 100vw, 1536px"
              className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.85)_100%)] transition-opacity group-hover:opacity-90" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6 sm:p-8">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-white uppercase backdrop-blur-md">
                Featured Class Archive
              </span>
              <span className="text-xs font-medium text-white/80">
                Click to inspect full view
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10 lg:p-14">
              <p className="text-[0.68rem] font-medium tracking-[0.18em] text-white/70 uppercase">
                College of Science Quadrangle · 2026
              </p>
              <h2 className="mt-3 max-w-4xl font-display text-[clamp(2rem,1.5rem+2.8vw,4rem)] leading-[1] font-medium tracking-[-0.045em] text-balance">
                The Algorithm: Full Departmental Assemble
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                The official graduating class photograph celebrating our shared
                journey through the Department of Computer Science.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Gallery Masonry / Grid */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5">
                  <Image
                    src={item.imageSrc}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="rounded-md bg-black/60 px-2.5 py-1 text-[0.625rem] font-medium tracking-wider text-white uppercase backdrop-blur-sm">
                      {item.tag}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                  <div>
                    <div className="flex items-center justify-between text-[0.68rem] font-medium tracking-wider text-muted uppercase">
                      <span>{item.category}</span>
                      <span>{item.year}</span>
                    </div>

                    <h3 className="mt-3 font-display text-xl leading-snug font-medium tracking-[-0.03em] text-foreground sm:text-2xl">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-xs text-muted">
                      Location: {item.location}
                    </p>

                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-foreground/75">
                      {item.caption}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-black/8 pt-4 text-xs font-semibold text-[#123f31]">
                    <span>Inspect Memory</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Archive Lanes Overview Section */}
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-[0.68rem] font-medium tracking-[0.2em] text-muted uppercase">
                Curated Collections
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.25rem,1.5rem+3vw,4.5rem)] leading-[0.98] font-medium tracking-[-0.05em] text-balance">
                Archive lanes by category.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-foreground/75 sm:text-lg">
                As more photographs from students, lecturers, and class representatives
                are submitted, each category expands into its own dedicated photo vault.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {[
                { title: "01 · Campus Life", count: "FUPRE Landmarks", desc: "The walkways, cafeteria runs, and College of Science quads." },
                { title: "02 · Classrooms & Labs", count: "Academic Vault", desc: "Late night coding sessions, whiteboard algorithms, and project demos." },
                { title: "03 · Gala & Dinners", count: "Social Records", desc: "Award banquets, departmental dinners, and celebration attire." },
                { title: "04 · Sign-Out & Legacy", count: "Graduation Moments", desc: "White shirt signatures, final year project defense, and farewells." },
              ].map((lane) => (
                <div
                  key={lane.title}
                  className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#f9f8f4] p-6 transition-colors hover:bg-white hover:shadow-sm sm:p-8"
                >
                  <div>
                    <span className="text-[0.65rem] font-medium tracking-widest text-[#123f31] uppercase">
                      {lane.count}
                    </span>
                    <h3 className="mt-3 font-display text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                      {lane.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                      {lane.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-6 lg:p-8"
          onClick={() => setActiveItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#0c0d0d] text-white shadow-2xl"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-[#123f31] px-2.5 py-1 text-[0.65rem] font-semibold text-[#d7ff5a] uppercase">
                  {activeItem.category}
                </span>
                <span className="text-xs font-medium text-white/60">
                  {activeItem.year} · {activeItem.location}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Image Area */}
            <div className="relative min-h-[20rem] flex-1 bg-black sm:min-h-[28rem] lg:min-h-[34rem]">
              <Image
                src={activeItem.imageSrc}
                alt={activeItem.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain"
              />
            </div>

            {/* Modal Footer Description */}
            <div className="border-t border-white/10 bg-[#121414] p-6 sm:p-8">
              <h3 className="font-display text-2xl font-medium tracking-tight text-white sm:text-3xl">
                {activeItem.title}
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">
                {activeItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Memory Modal */}
      {isSubmitModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Contribute a Memory"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <h3 className="font-display text-2xl font-medium tracking-tight text-foreground">
                  Contribute a Memory
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Add your photo or story to the Class of 2026 Archive.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="rounded-lg p-2 text-foreground/50 hover:bg-black/5 hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {submissionSuccess ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#123f31] text-[#d7ff5a]">
                  <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6 stroke-current stroke-2">
                    <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="mt-4 font-display text-xl font-medium text-foreground">
                  Memory Received!
                </h4>
                <p className="mt-2 text-sm text-muted">
                  Thank you for contributing to The Algorithm 2026 archive.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-6 text-xs font-medium text-white hover:bg-foreground/85"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmissionSuccess(true);
                }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Your Name / Nickname
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victor E. / CS '26"
                    className="mt-1.5 w-full rounded-lg border border-black/15 px-3.5 py-2.5 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Category
                  </label>
                  <select className="mt-1.5 w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground">
                    <option value="Class">The Class & Friends</option>
                    <option value="Labs">Classrooms & Labs</option>
                    <option value="Campus">Campus Life & Landmarks</option>
                    <option value="Celebrations">Dinners & Sign-Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Memory Title or Caption
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the moment, who was there, and why it mattered..."
                    className="mt-1.5 w-full rounded-lg border border-black/15 px-3.5 py-2.5 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-[#123f31] text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#185341]"
                  >
                    Submit to Class Archive
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
