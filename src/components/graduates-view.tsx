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
        closeProfile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeProfile]);

  // History API for Swipe-to-Close
  const historyPushedRef = useRef(false);

  const openProfile = (grad: GraduateProfile) => {
    setActiveProfile(grad);
    window.history.pushState(null, "", `#${grad.id}`);
    historyPushedRef.current = true;
  };

  const closeProfile = () => {
    if (historyPushedRef.current) {
      window.history.back();
      historyPushedRef.current = false;
    } else {
      setActiveProfile(null);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (activeProfile && window.location.hash !== `#${activeProfile.id}`) {
        setActiveProfile(null);
        historyPushedRef.current = false;
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeProfile]);

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
                  onClick={() => openProfile(grad)}
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

      {/* Full-Screen Modal */}
      {activeProfile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeProfile.name} Profile`}
          className="fixed inset-0 z-50 bg-black lg:bg-black/80 lg:backdrop-blur-md lg:p-6 xl:p-10"
          style={{ animation: "fadeIn 0.3s ease-out forwards" }}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>

          {/* MOBILE FULL-SCREEN BACKGROUND IMAGE */}
          <div className="absolute inset-0 z-0 lg:hidden">
            <Image
              src={activeProfile.imageSrc}
              alt={activeProfile.alt}
              fill
              priority
              className="object-cover object-top"
            />
            {/* Gradient overlay at bottom to ensure image fades cleanly into drawer */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          </div>

          {/* MOBILE CLOSE BUTTON */}
          <button
            type="button"
            onClick={closeProfile}
            className="absolute right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40 lg:hidden"
            aria-label="Close modal"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-current stroke-2">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>

          {/* MOBILE INTERACTIVE DRAWER (Scroll Container) */}
          <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden scroll-smooth lg:hidden">
            <div className="flex min-h-[100dvh] flex-col">
              {/* Spacer - Clicking it closes the modal */}
              <div
                className="h-[55dvh] w-full shrink-0"
                onClick={closeProfile}
              />

              {/* The White Drawer */}
              <div
                className="relative flex-1 shrink-0 rounded-t-3xl bg-white shadow-2xl"
                style={{ animation: "slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
              >
                {/* Drag Handle */}
                <div className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-black/15" />

                {/* Mobile Header */}
                <div className="px-6 pb-6 pt-10 text-center">
                  <h2 className="font-display text-3xl font-medium leading-[1.05] tracking-tight text-foreground">
                    {activeProfile.name}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    &ldquo;{activeProfile.nickname}&rdquo;
                  </p>
                  <p className="mt-4 flex items-center justify-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted">
                    <span>Swipe up for details</span>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-3 w-3 animate-bounce stroke-current stroke-2"
                    >
                      <path d="M8 13V3m0 0L4 7m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </p>
                </div>

                <div className="divide-y divide-black/10">
                  <DossierContent profile={activeProfile} />
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP SPLIT-SCREEN MODAL */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden h-full w-full max-w-6xl mx-auto overflow-hidden rounded-2xl bg-white shadow-2xl lg:flex"
            style={{ animation: "scaleUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
          >
            {/* Desktop Left: Image */}
            <div className="relative flex w-[45%] shrink-0 flex-col bg-[#070e0a]">
              {/* Desktop Close Button Row */}
              <div className="absolute left-0 right-0 top-0 z-10 flex justify-between p-6">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-white/80 drop-shadow-md">
                  NACOS FUPRE · 2026
                </p>
                <button
                  type="button"
                  onClick={closeProfile}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 stroke-current stroke-2">
                    <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="relative h-full w-full">
                <Image
                  src={activeProfile.imageSrc}
                  alt={activeProfile.alt}
                  fill
                  priority
                  sizes="45vw"
                  className="object-cover object-top"
                />
              </div>
            </div>

            {/* Desktop Right: Dossier Body */}
            <div className="flex-1 divide-y divide-black/10 overflow-y-auto bg-white">
              <div className="px-8 py-10">
                <h2 className="font-display text-4xl font-medium tracking-tight text-foreground">
                  {activeProfile.name}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  &ldquo;{activeProfile.nickname}&rdquo; · Born {activeProfile.dob}
                </p>
              </div>
              <DossierContent profile={activeProfile} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DossierContent({ profile }: { profile: GraduateProfile }) {
  return (
    <>
      {/* Quote */}
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted">
          Favourite Quote
        </p>
        <p className="mt-3 font-display text-lg italic leading-relaxed text-foreground sm:text-xl">
          &ldquo;{profile.favouriteQuote}&rdquo;
        </p>
      </div>

      {/* Advice */}
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted">
          Advice to Younger Level
        </p>
        <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
          &ldquo;{profile.adviceToYoungerLevel}&rdquo;
        </p>
      </div>

      {/* Profile Attributes */}
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">Skills</dt>
            <dd className="mt-1 font-medium text-foreground/90">{profile.skillsHobbies}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">Fav. Lecturer</dt>
            <dd className="mt-1 font-medium text-foreground/90">{profile.favoriteLecturer}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">Best / Worst Level</dt>
            <dd className="mt-1 font-medium text-foreground/90">
              {profile.favoriteLevel}L / {profile.worstLevel}L
            </dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">If Not Comp Sci</dt>
            <dd className="mt-1 font-medium text-foreground/90">{profile.ifNotComputerScience}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">Stay or Japa</dt>
            <dd className="mt-1 font-semibold text-[#123f31]">{profile.stayOrJapa}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-medium uppercase tracking-wider text-muted">Fav. Colour</dt>
            <dd className="mt-1 font-medium text-foreground/90">{profile.favouriteColour}</dd>
          </div>
        </dl>
      </div>

      {/* Friends */}
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted">
          Department Friends
        </p>
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">
          {profile.departmentFriends.join(", ")}
        </p>
      </div>
    </>
  );
}
