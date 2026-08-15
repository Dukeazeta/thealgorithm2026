"use client";

import Image from "next/image";
import { useState, useMemo, useEffect, useRef } from "react";

export type GraduateProfile = {
  id: string;
  name: string;
  nickname: string;
  imageSrc: string;
  alt: string;
  dob: string;
  favouriteColour: string;
  adviceToYoungerLevel: string;
  skillsHobbies: string;
  favoriteLecturer: string;
  favoriteLevel: string;
  worstLevel: string;
  departmentFriends: string[];
  favouriteQuote: string;
  ifNotComputerScience: string;
  stayOrJapa: string;
};

const GRADUATES_ARCHIVE: GraduateProfile[] = [
  {
    id: "duke-azeta",
    name: "Duke Azeta",
    nickname: "Duke",
    imageSrc: "/images/graduates/duke-azeta.webp",
    alt: "Duke Azeta - FYB Class of 2026",
    dob: "December 14",
    favouriteColour: "Red",
    adviceToYoungerLevel:
      "Stick with your friends, there's more to life than school!",
    skillsHobbies: "Coding & Athletics",
    favoriteLecturer: "Dr Abere",
    favoriteLevel: "300",
    worstLevel: "200",
    departmentFriends: ["Pleasant", "Xammie", "Tochukwu", "Bello", "Clinton"],
    favouriteQuote: "No Wahala",
    ifNotComputerScience: "Computer Engineering",
    stayOrJapa: "Japa",
  },
  {
    id: "egbe-goodness",
    name: "Egbe Goodness Oghenerukome",
    nickname: "Cinderella Ifunanya",
    imageSrc: "/images/graduates/egbe-goodness.webp",
    alt: "Egbe Goodness Oghenerukome - FYB Class of 2026",
    dob: "November 14",
    favouriteColour: "Brown, Black, White",
    adviceToYoungerLevel: "Protect your mental health & put God first.",
    skillsHobbies: "Watching movies, Eating, Reading novels",
    favoriteLecturer: "Mr Elohozino",
    favoriteLevel: "300",
    worstLevel: "200",
    departmentFriends: ["Toryella", "Maltilda", "Lucy"],
    favouriteQuote: "It Is Well",
    ifNotComputerScience: "Architecture",
    stayOrJapa: "Japa",
  },
  {
    id: "alika-ogechi",
    name: "Alika Ogechi",
    nickname: "Oge",
    imageSrc: "/images/graduates/alika-ogechi.webp",
    alt: "Alika Ogechi - FYB Class of 2026",
    dob: "January 28",
    favouriteColour: "Grey",
    adviceToYoungerLevel: "Learn o stay focused & build connections",
    skillsHobbies: "Making money",
    favoriteLecturer: "None",
    favoriteLevel: "All",
    worstLevel: "All",
    departmentFriends: ["Ejiro", "Joshua", "Faka", "Daniel & My Formation"],
    favouriteQuote:
      "Learn to take that one little step, it might seem small but it makes you grow",
    ifNotComputerScience: "Aeronautical Engineering",
    stayOrJapa: "Stay Japa",
  },
];

export function GraduatesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProfile, setActiveProfile] =
    useState<GraduateProfile | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredGraduates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return GRADUATES_ARCHIVE;
    return GRADUATES_ARCHIVE.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.nickname.toLowerCase().includes(q) ||
        g.favouriteQuote.toLowerCase().includes(q) ||
        g.skillsHobbies.toLowerCase().includes(q) ||
        g.departmentFriends.some((f) => f.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeProfile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeProfile]);

  // Keyboard accessibility for Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveProfile(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // True Inner-Image Parallax Effect
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
        if (!gridRef.current) return;

        const imgElements =
          gridRef.current.querySelectorAll<HTMLElement>("[data-parallax-img]");
        imgElements.forEach((img) => {
          const parent = img.parentElement;
          if (!parent) return;

          gsap.fromTo(
            img,
            { yPercent: -8, scale: 1.12 },
            {
              yPercent: 8,
              scale: 1.12,
              ease: "none",
              scrollTrigger: {
                trigger: parent,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
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
  }, [filteredGraduates]);

  return (
    <div ref={containerRef} className="min-h-[100dvh] bg-white text-foreground">
      {/* Compact Header */}
      <section className="border-b border-black/10 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-medium tracking-[0.2em] text-muted uppercase">
              The Graduates · Class of 2026 · {filteredGraduates.length} catalogued
            </p>
            <h1 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              The Algorithm.
            </h1>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or nickname..."
              className="w-full border-b border-black/20 bg-transparent py-2 pr-8 pl-0 text-xs text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground"
            />
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="pointer-events-none absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2 stroke-current text-muted"
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="6" strokeWidth="1.5" />
              <path d="m13.5 13.5 4 4" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-3 py-5 sm:px-5 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {filteredGraduates.length === 0 ? (
            <div className="py-20 text-center">
              <h2 className="font-display text-xl font-medium text-foreground">
                No matching graduate
              </h2>
              <p className="mt-1 text-xs text-muted">
                Nothing matches &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 border-b border-foreground pb-0.5 text-xs font-semibold text-foreground hover:opacity-70"
              >
                Reset
              </button>
            </div>
          ) : (
            <div
              ref={gridRef}
              className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6"
            >
              {filteredGraduates.map((grad) => (
                <div
                  key={grad.id}
                  onClick={() => setActiveProfile(grad)}
                  className="group cursor-pointer"
                >
                  {/* Poster Image with Parallax */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0a120c]">
                    <div
                      data-parallax-img
                      className="relative h-full w-full will-change-transform"
                    >
                      <Image
                        src={grad.imageSrc}
                        alt={grad.alt}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>

                  {/* Minimal Baseline Text */}
                  <div className="mt-2 flex items-baseline justify-between gap-2 sm:mt-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-sm font-medium tracking-tight text-foreground sm:text-base">
                        {grad.name}
                      </h3>
                      <p className="text-[0.65rem] text-muted sm:text-xs">
                        &ldquo;{grad.nickname}&rdquo;
                      </p>
                    </div>
                    <span className="shrink-0 text-[0.65rem] font-medium text-muted underline underline-offset-2 transition-colors group-hover:text-foreground sm:text-xs">
                      View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Full-Screen Modal Sheet (No Cards Inside) */}
      {activeProfile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeProfile.name} Profile`}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-6 lg:p-10"
          onClick={() => setActiveProfile(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-full w-full flex-col overflow-hidden bg-white text-foreground sm:h-auto sm:max-h-[88vh] sm:max-w-5xl sm:rounded-2xl sm:shadow-2xl"
          >
            {/* Minimal Top Bar */}
            <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-4 py-2.5 sm:px-6 sm:py-3">
              <p className="text-[0.65rem] font-medium tracking-[0.15em] text-muted uppercase">
                NACOS FUPRE · Class of 2026
              </p>
              <button
                type="button"
                onClick={() => setActiveProfile(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-foreground"
                aria-label="Close modal"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-current stroke-2">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Content: stacks on mobile, side-by-side on desktop */}
            <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
              {/* Image */}
              <div className="relative shrink-0 bg-[#070e0a] lg:w-[42%]">
                <div className="relative aspect-[4/5] w-full lg:h-full lg:aspect-auto">
                  <Image
                    src={activeProfile.imageSrc}
                    alt={activeProfile.alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-top lg:object-contain"
                  />
                </div>
              </div>

              {/* Dossier — pure divide-y, zero nested cards */}
              <div className="flex-1 divide-y divide-black/10 overflow-y-auto lg:overflow-y-auto">
                {/* Identity */}
                <div className="px-5 py-5 sm:px-8 sm:py-6">
                  <h2 className="font-display text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                    {activeProfile.name}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    &ldquo;{activeProfile.nickname}&rdquo; · Born {activeProfile.dob}
                  </p>
                </div>

                {/* Quote */}
                <div className="px-5 py-4 sm:px-8 sm:py-5">
                  <p className="text-[0.6rem] font-semibold tracking-widest text-muted uppercase">
                    Favourite Quote
                  </p>
                  <p className="mt-1 font-display text-sm italic leading-snug text-foreground sm:text-base">
                    &ldquo;{activeProfile.favouriteQuote}&rdquo;
                  </p>
                </div>

                {/* Advice */}
                <div className="px-5 py-4 sm:px-8 sm:py-5">
                  <p className="text-[0.6rem] font-semibold tracking-widest text-muted uppercase">
                    Advice to Younger Level
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/85 sm:text-sm">
                    &ldquo;{activeProfile.adviceToYoungerLevel}&rdquo;
                  </p>
                </div>

                {/* Profile Attributes — flat definition list */}
                <div className="px-5 py-4 sm:px-8 sm:py-5">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-3">
                    <div>
                      <dt className="text-[0.6rem] text-muted uppercase">Skills</dt>
                      <dd className="font-medium">{activeProfile.skillsHobbies}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6rem] text-muted uppercase">Fav. Lecturer</dt>
                      <dd className="font-medium">{activeProfile.favoriteLecturer}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6rem] text-muted uppercase">Best / Worst Level</dt>
                      <dd className="font-medium">
                        {activeProfile.favoriteLevel}L / {activeProfile.worstLevel}L
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.6rem] text-muted uppercase">If Not Comp Sci</dt>
                      <dd className="font-medium">{activeProfile.ifNotComputerScience}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6rem] text-muted uppercase">Stay or Japa</dt>
                      <dd className="font-semibold text-[#123f31]">{activeProfile.stayOrJapa}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6rem] text-muted uppercase">Fav. Colour</dt>
                      <dd className="font-medium">{activeProfile.favouriteColour}</dd>
                    </div>
                  </dl>
                </div>

                {/* Friends */}
                <div className="px-5 py-4 sm:px-8 sm:py-5">
                  <p className="text-[0.6rem] font-semibold tracking-widest text-muted uppercase">
                    Department Friends
                  </p>
                  <p className="mt-1 text-xs text-foreground">
                    {activeProfile.departmentFriends.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
