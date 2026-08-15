"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

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
    location: "College of Computing Quad, FUPRE",
    imageSrc: "/images/hero-bg.webp",
    alt: "The Algorithm Class of 2026 assembled in front of the College of Computing building",
    caption:
      "The complete graduating class gathered under the morning sky in front of the College of Computing. A definitive visual testament to four years of perseverance, collaboration, and shared triumph.",
    tag: "Official Record",
    featured: true,
  },
  {
    id: "coding-lab-session",
    title: "Late Night Coding Lab Session",
    category: "Labs",
    year: "2026",
    location: "Software Engineering Lab",
    imageSrc: "/images/gallery/coding_lab_session.jpg",
    alt: "Students collaborating during a late night coding session",
    caption:
      "Hours of debugging and collaboration. The Software Engineering lab where countless projects were born and final year defenses were prepared.",
    tag: "Academic",
  },
  {
    id: "gala-dinner-night",
    title: "NACOS FUPRE Gala & Award Night",
    category: "Celebrations",
    year: "2026",
    location: "Main Auditorium",
    imageSrc: "/images/gallery/gala_dinner_night.jpg",
    alt: "Students dressed up at the Gala dinner night",
    caption:
      "A night of elegance and celebration marking the end of a rigorous academic session. Recognizing the brightest minds in the department.",
    tag: "Event",
  },
  {
    id: "project-defence",
    title: "Final Year Project Defence",
    category: "Class",
    year: "2026",
    location: "Department of Computer Science",
    imageSrc: "/images/gallery/project_defence.jpg",
    alt: "Student defending their final year project",
    caption:
      "The culmination of four years of study. Defending our capstone projects before the faculty panel — a milestone of immense pride and relief.",
    tag: "Milestone",
  },
  {
    id: "college-of-science-dusk",
    title: "College of Computing at Dusk",
    category: "Campus",
    year: "2026",
    location: "Faculty Plaza",
    imageSrc: "/images/hero-bg.webp",
    alt: "The College of Computing building and surroundings",
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

export function GalleryView({ items = GALLERY_ITEMS }: { items?: GalleryItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyboard accessibility
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

  // Lock body scroll on modal open
  useEffect(() => {
    if (activeItem || isSubmitModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [activeItem, isSubmitModalOpen]);

  function getGridClasses(index: number) {
    const pattern = [
      // 0: Large square on mobile | Large square on desktop
      "col-span-2 row-span-2 md:col-span-2 md:row-span-2",
      // 1: Vertical rectangle on mobile | Small square on desktop
      "col-span-1 row-span-2 md:col-span-1 md:row-span-1",
      // 2: Small square on mobile | Vertical rectangle on desktop
      "col-span-1 row-span-1 md:col-span-1 md:row-span-2",
      // 3: Small square on mobile | Small square on desktop
      "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
      // 4: Horizontal rectangle on mobile | Wide rectangle on desktop
      "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
      // 5: Small square on mobile | Small square on desktop
      "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
      // 6: Vertical rectangle on mobile | Small square on desktop
      "col-span-1 row-span-2 md:col-span-1 md:row-span-1",
    ];
    return pattern[index % pattern.length];
  }

  const containerRef = useRef<HTMLElement>(null);

  const galleryItems = items;
  const filteredItems =
    selectedCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  // Inner-image parallax via GSAP
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function initParallax() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        if (!containerRef.current) return;

        const items = containerRef.current.querySelectorAll<HTMLElement>("[data-parallax-item]");

        items.forEach((item) => {
          const imgWrapper = item.querySelector<HTMLElement>("[data-parallax-img]");
          if (!imgWrapper) return;

          gsap.fromTo(
            imgWrapper,
            { yPercent: -15 },
            {
              yPercent: 15,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });
      }, containerRef);

      cleanup = () => ctx.revert();
    }

    void initParallax();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [filteredItems]);

  const featuredItem = galleryItems[0];

  return (
    <div className="min-h-[100dvh] bg-[#f5f4f0] text-zinc-900">

      {/* ── HEADER ── Asymmetric split, left-aligned */}
      <section className="px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-5 lg:px-0 lg:pt-8 lg:pb-6">
        <div className="mx-auto max-w-[1400px] lg:pl-[6vw]">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-16">

            {/* Left: Title block */}
            <div className="lg:col-span-7">
              <p className="text-[0.6rem] font-medium tracking-[0.25em] text-zinc-400 uppercase">
                The Living Archive
              </p>

              <h1 className="mt-4 text-4xl font-medium tracking-tighter leading-none text-zinc-900 md:text-6xl lg:text-7xl">
                The moments
                <br />
                we get to keep.
              </h1>

              <p className="mt-6 max-w-[55ch] text-base leading-relaxed text-zinc-500">
                The visual repository of our passage through FUPRE. Every
                photograph, landmark, and celebration preserved with context.
              </p>
            </div>

            {/* Right: Action + count */}
            <div className="mt-8 flex items-end justify-between lg:col-span-5 lg:mt-0 lg:flex-col lg:items-end lg:justify-end lg:pr-[4vw]">
              <div className="hidden text-right lg:block">
                <p className="text-[0.6rem] font-medium tracking-[0.25em] text-zinc-400 uppercase">
                  Class of 2026
                </p>
                <p className="mt-1 text-sm tabular-nums text-zinc-500">
                  {galleryItems.length} memories archived
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitModalOpen(true);
                  setSubmissionSuccess(false);
                }}
                className="inline-flex h-10 items-center gap-2 border border-zinc-900 px-5 text-[0.7rem] font-semibold tracking-wide text-zinc-900 uppercase transition-all duration-200 hover:bg-zinc-900 hover:text-white active:scale-[0.98] lg:mt-6"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 stroke-current" strokeWidth="2">
                  <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                </svg>
                Contribute
              </button>
            </div>
          </div>

          {/* Filter strip — flat, no pills, just underlines */}
          <div className="mt-8 flex items-center gap-6 border-t border-zinc-200 pt-5 lg:mt-10 lg:gap-8">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`relative pb-1 text-[0.7rem] font-medium tracking-wide uppercase transition-colors duration-200 ${
                    isSelected
                      ? "text-zinc-900"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {category === "All" ? "All" : category}
                  {isSelected && (
                    <span className="absolute inset-x-0 -bottom-px h-[1.5px] bg-zinc-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED HERO ── Full-bleed, no card wrapper (Rule 4: Anti-Card) */}
      {selectedCategory === "All" && featuredItem && (
        <section className="relative">
          <div
            onClick={() => setActiveItem(featuredItem)}
            className="group relative min-h-[50dvh] cursor-pointer overflow-hidden bg-zinc-900 sm:min-h-[60dvh] lg:min-h-[75dvh]"
          >
            <Image
              src={featuredItem.imageSrc}
              alt={featuredItem.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Bottom-left metadata */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
              <div className="mx-auto max-w-[1400px]">
                <p className="text-[0.6rem] font-medium tracking-[0.25em] text-white/50 uppercase">
                  {featuredItem.location}
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-medium tracking-tighter leading-none text-white md:text-5xl lg:text-6xl">
                  {featuredItem.title}
                </h2>
                <p className="mt-4 max-w-[55ch] text-sm leading-relaxed text-white/70">
                  {featuredItem.caption}
                </p>
              </div>
            </div>

            {/* Top-right hint */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
              <span className="text-[0.6rem] font-medium tracking-[0.2em] text-white/40 uppercase transition-colors duration-300 group-hover:text-white/70">
                Click to inspect
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── MASONRY GRID ── Preserved bento layout + inner-image parallax */}
      <section ref={containerRef} className="py-[2px]">
        <div className="mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[10rem] sm:auto-rows-[12rem] md:auto-rows-[16rem] lg:auto-rows-[20rem] grid-flow-row-dense gap-[2px]">
            {filteredItems.map((item, index) => (
              <GalleryCard
                key={item.id}
                item={item}
                index={index}
                className={getGridClasses(index)}
                onClick={() => setActiveItem(item)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX MODAL ── Stark, minimal, full viewport */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
          onClick={() => setActiveItem(null)}
          style={{ animation: "fadeIn 0.2s ease-out forwards" }}
        >
          {/* Top bar */}
          <div
            className="flex shrink-0 items-center justify-between px-6 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <span className="text-[0.6rem] font-medium tracking-[0.2em] text-white/40 uppercase">
                {activeItem.category}
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span className="text-[0.65rem] text-white/40">
                {activeItem.year}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="flex h-9 w-9 items-center justify-center text-white/50 transition-colors hover:text-white"
              aria-label="Close"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-current" strokeWidth="1.5">
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Image area */}
          <div
            className="relative flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeItem.imageSrc}
              alt={activeItem.alt}
              fill
              unoptimized
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Bottom metadata */}
          <div
            className="shrink-0 border-t border-white/8 px-6 py-5 sm:px-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-medium tracking-tight text-white sm:text-2xl">
              {activeItem.title}
            </h3>
            <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-white/50">
              {activeItem.caption}
            </p>
          </div>
        </div>
      )}

      {/* ── CONTRIBUTE MODAL ── Sharp panel, Rule 6 form patterns */}
      {isSubmitModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Contribute a Memory"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setIsSubmitModalOpen(false)}
          style={{ animation: "fadeIn 0.2s ease-out forwards" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white p-8 shadow-2xl sm:p-10"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-medium tracking-tight text-zinc-900">
                  Contribute a Memory
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Add your photo or story to the Class of 2026 Archive.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-900"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-current" strokeWidth="1.5">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-6 h-px bg-zinc-100" />

            {submissionSuccess ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center bg-zinc-900 text-white">
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 stroke-current stroke-2">
                    <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="mt-5 text-lg font-medium tracking-tight text-zinc-900">
                  Memory Received
                </h4>
                <p className="mt-2 text-sm text-zinc-400">
                  Thank you for contributing to The Algorithm 2026 archive.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="mt-8 inline-flex h-10 items-center justify-center bg-zinc-900 px-6 text-[0.7rem] font-semibold tracking-wide text-white uppercase transition-all duration-200 hover:bg-zinc-700 active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmissionError("");
                  setIsSubmitting(true);
                  const form = e.currentTarget;
                  void fetch("/api/submissions", {
                    method: "POST",
                    body: new FormData(form),
                  })
                    .then(async (response) => {
                      const body = (await response.json()) as { error?: string };
                      if (!response.ok) throw new Error(body.error ?? "Submission failed.");
                      setSubmissionSuccess(true);
                    })
                    .catch((error: unknown) => {
                      setSubmissionError(error instanceof Error ? error.message : "Submission failed.");
                    })
                    .finally(() => setIsSubmitting(false));
                }}
                className="mt-6 space-y-5"
              >
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-[0.7rem] font-semibold tracking-wide text-zinc-900 uppercase">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="contributorName"
                    required
                    placeholder="e.g. Victor E. / CS '26"
                    className="w-full border border-zinc-200 bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 transition-colors focus:border-zinc-900"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-[0.7rem] font-semibold tracking-wide text-zinc-900 uppercase">
                    Category
                  </label>
                  <select
                    name="category"
                    className="w-full border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900"
                  >
                    <option value="Class">The Class & Friends</option>
                    <option value="Labs">Classrooms & Labs</option>
                    <option value="Campus">Campus Life & Landmarks</option>
                    <option value="Celebrations">Dinners & Sign-Out</option>
                  </select>
                </div>

                {/* Title + Caption */}
                <div className="space-y-1.5">
                  <label className="block text-[0.7rem] font-semibold tracking-wide text-zinc-900 uppercase">
                    Memory Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Give the memory a title"
                    className="w-full border border-zinc-200 bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 transition-colors focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[0.7rem] font-semibold tracking-wide text-zinc-900 uppercase">
                    Caption
                  </label>
                  <textarea
                    name="caption"
                    required
                    rows={3}
                    placeholder="Describe the moment..."
                    className="w-full border border-zinc-200 bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 transition-colors resize-none focus:border-zinc-900"
                  />
                </div>

                {/* Image upload */}
                <div className="space-y-1.5">
                  <label className="block text-[0.7rem] font-semibold tracking-wide text-zinc-900 uppercase">
                    Image (optional)
                  </label>
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="block w-full border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 file:mr-3 file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-zinc-600"
                  />
                  <p className="text-[0.65rem] text-zinc-300">JPEG, PNG, or WebP up to 10 MB.</p>
                </div>

                {submissionError && (
                  <p className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{submissionError}</p>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 w-full items-center justify-center bg-zinc-900 text-[0.7rem] font-semibold tracking-wide text-white uppercase transition-all duration-200 hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending memory..." : "Submit to Archive"}
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

/* ── GALLERY CARD ── Preserved parallax internals + stagger reveal */
function GalleryCard({
  item,
  onClick,
  className,
  index,
}: {
  item: GalleryItem;
  onClick: () => void;
  className?: string;
  index: number;
}) {
  return (
    <article
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden w-full h-full ${className || ""}`}
      style={{
        animation: `galleryReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="relative w-full h-full overflow-hidden bg-zinc-200" data-parallax-item>
        <div className="absolute -inset-[20%] h-[140%] w-[140%] will-change-transform" data-parallax-img>
          <Image
            src={item.imageSrc}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
          />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/30 z-10" />
        {/* Title on hover */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-[0.65rem] font-medium tracking-[0.15em] text-white/60 uppercase">
            {item.tag}
          </span>
          <p className="mt-1 text-sm font-medium leading-snug tracking-tight text-white">
            {item.title}
          </p>
        </div>
      </div>
    </article>
  );
}
