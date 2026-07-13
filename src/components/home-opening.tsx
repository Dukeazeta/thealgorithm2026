"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type Ref } from "react";
import { EditorialIntro } from "@/components/editorial-intro";
import { usePrefersReducedMotion } from "@/hooks/use-home-scroll";

export function HomeOpening() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLAnchorElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    let cleanupAnimation: (() => void) | undefined;

    async function mountAnimation() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

      const track = trackRef.current;
      const stage = stageRef.current;
      const card = cardRef.current;
      const media = mediaRef.current;
      const blackout = blackoutRef.current;
      const copy = copyRef.current;
      const cue = cueRef.current;
      const globe = globeRef.current;

      if (
        !track ||
        !stage ||
        !card ||
        !media ||
        !blackout ||
        !copy ||
        !cue ||
        !globe
      ) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const navHeight = () => {
        const header = document.querySelector("header");
        return header?.getBoundingClientRect().height ?? 68;
      };

      const context = gsap.context(() => {
        gsap.set(globe, {
          autoAlpha: 0,
          scale: 0.48,
          rotate: -10,
          transformOrigin: "50% 50%",
        });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: track,
            start: () => `top top+=${navHeight()}`,
            end: () => `+=${Math.max(window.innerHeight * 1.45, 920)}`,
            scrub: 0.55,
            pin: stage,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => {
              const cueIsHidden = progress > 0.2;
              cue.tabIndex = cueIsHidden ? -1 : 0;
              cue.setAttribute("aria-hidden", String(cueIsHidden));
            },
          },
        });

        timeline
          .to(stage, { padding: 0, duration: 0.38 }, 0)
          .to(card, { borderRadius: 0, duration: 0.38 }, 0)
          .to(media, { scale: 1.13, duration: 1 }, 0)
          .to(copy, { autoAlpha: 0, y: -56, duration: 0.28 }, 0.08)
          .to(cue, { autoAlpha: 0, y: -20, duration: 0.2 }, 0.03)
          .to(blackout, { opacity: 0.94, duration: 0.52 }, 0.18)
          .to(
            globe,
            {
              autoAlpha: 1,
              scale: 1,
              rotate: 0,
              duration: 0.5,
              ease: "power2.out",
            },
            0.34,
          )
          .to(
            globe,
            { scale: 1.08, rotate: 7, duration: 0.16 },
            0.84,
          );
      }, track);

      const refreshFrame = window.requestAnimationFrame(() =>
        ScrollTrigger.refresh(),
      );

      cleanupAnimation = () => {
        window.cancelAnimationFrame(refreshFrame);
        cue.tabIndex = 0;
        cue.removeAttribute("aria-hidden");
        context.revert();
      };
    }

    void mountAnimation();

    return () => {
      cancelled = true;
      cleanupAnimation?.();
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <>
        <StaticHero />
        <EditorialIntro forceReveal />
      </>
    );
  }

  return (
    <>
      <section ref={trackRef} data-hero-track className="relative bg-white">
        <div
          ref={stageRef}
          data-hero-stage
          className="relative flex h-[calc(100svh-var(--nav-height))] w-full items-center justify-center bg-white p-2 sm:p-3 md:p-4"
        >
          <div
            ref={cardRef}
            data-hero-card
            className="relative isolate h-full w-full overflow-hidden rounded-2xl sm:rounded-[1.35rem] md:rounded-[1.75rem]"
          >
            <div
              ref={mediaRef}
              className="absolute inset-0 animate-hero-media will-change-transform"
            >
              <Image
                src="/images/hero-class.jpg"
                alt="Cinematic dusk view over campus and petroleum industry silhouettes — placeholder for the Algorithm Class of 2026 group portrait"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.58)_45%,rgba(0,0,0,0.72)_100%)]"
            />
            <div
              ref={blackoutRef}
              aria-hidden="true"
              className="absolute inset-0 bg-black opacity-0"
            />

            <WireframeGlobe ref={globeRef} />

            <div
              ref={copyRef}
              className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center will-change-transform sm:px-8 md:px-12"
            >
              <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
                <h1
                  id="hero-heading"
                  className="animate-hero-rise font-display text-[clamp(1.85rem,1.1rem+4.2vw,4.35rem)] leading-[1.12] font-medium tracking-[-0.03em] text-balance text-white"
                >
                  We came as students. We leave as The Algorithm.
                </h1>
                <p className="animate-hero-rise-delay mt-5 max-w-xl text-[clamp(0.95rem,0.85rem+0.5vw,1.125rem)] leading-relaxed text-white/78 sm:mt-6">
                  The FUPRE Class of 2026 — remembered together.
                </p>
              </div>
            </div>

            <Link
              ref={cueRef}
              href="#introduction"
              className="animate-hero-fade-delay group absolute right-4 bottom-4 z-20 inline-flex items-center gap-3 rounded-lg text-white/90 transition-colors hover:text-white focus-visible:outline-white sm:right-6 sm:bottom-6 md:right-8 md:bottom-8"
            >
              <span className="text-[0.7rem] font-medium tracking-[0.08em] uppercase sm:text-[0.75rem]">
                Scroll to explore
              </span>
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/55 transition-colors group-hover:border-white group-hover:bg-white/10"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className="h-3.5 w-3.5 animate-scroll-nudge"
                  aria-hidden="true"
                >
                  <path
                    d="M8 3v9M4.5 8.5 8 12l3.5-3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <EditorialIntro />
    </>
  );
}

type WireframeGlobeProps = {
  ref: Ref<HTMLDivElement>;
};

function WireframeGlobe({ ref }: WireframeGlobeProps) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none invisible absolute inset-0 z-[5] flex items-center justify-center opacity-0 will-change-transform"
    >
      <div className="relative aspect-square w-[min(76vw,76vh)] max-w-[54rem]">
        <div className="absolute inset-[9%] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <svg
          viewBox="0 0 600 600"
          fill="none"
          className="absolute inset-0 h-full w-full drop-shadow-[0_0_42px_rgba(217,70,239,0.35)]"
        >
          <defs>
            <linearGradient id="globe-gradient" x1="78" y1="90" x2="534" y2="520">
              <stop stopColor="#f0abfc" />
              <stop offset="0.48" stopColor="#d946ef" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
            <radialGradient id="globe-core" cx="0" cy="0" r="1" gradientTransform="translate(300 300) rotate(90) scale(250)">
              <stop stopColor="#c026d3" stopOpacity="0.2" />
              <stop offset="1" stopColor="#09090b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="300" cy="300" r="236" fill="url(#globe-core)" />
          <g stroke="url(#globe-gradient)" strokeWidth="1.5" opacity="0.86">
            <circle cx="300" cy="300" r="236" />
            <ellipse cx="300" cy="300" rx="168" ry="236" />
            <ellipse cx="300" cy="300" rx="82" ry="236" />
            <ellipse cx="300" cy="300" rx="236" ry="82" />
            <ellipse cx="300" cy="300" rx="236" ry="168" />
            <path d="M97 180c62 37 132 56 203 56s141-19 203-56" />
            <path d="M97 420c62-37 132-56 203-56s141 19 203 56" />
            <path d="M180 97c37 62 56 132 56 203s-19 141-56 203" />
            <path d="M420 97c-37 62-56 132-56 203s19 141 56 203" />
          </g>
          <g fill="#f5d0fe">
            <circle cx="300" cy="64" r="4" />
            <circle cx="503" cy="180" r="3" />
            <circle cx="536" cy="300" r="4" />
            <circle cx="97" cy="420" r="3" />
            <circle cx="180" cy="503" r="4" />
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <span className="text-[0.62rem] font-medium tracking-[0.34em] text-fuchsia-100/70 uppercase sm:text-xs">
            FUPRE · Class of 2026
          </span>
          <span className="mt-3 font-display text-[clamp(1.4rem,4vw,3.6rem)] leading-none tracking-[-0.04em]">
            The Algorithm
          </span>
        </div>
      </div>
    </div>
  );
}

function StaticHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-white px-2 pb-2 sm:px-3 sm:pb-3 md:px-4 md:pb-4"
    >
      <div className="relative isolate min-h-[calc(100svh-var(--nav-height)-0.5rem)] overflow-hidden rounded-2xl sm:rounded-[1.35rem] md:rounded-[1.75rem]">
        <Image
          src="/images/hero-class.jpg"
          alt="Cinematic dusk view over campus and petroleum industry silhouettes — placeholder for the Algorithm Class of 2026 group portrait"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.58)_45%,rgba(0,0,0,0.72)_100%)]"
        />
        <div className="relative z-10 flex min-h-[calc(100svh-var(--nav-height)-0.5rem)] flex-col items-center justify-center px-5 py-20 text-center sm:px-8 md:px-12">
          <h1
            id="hero-heading"
            className="font-display text-[clamp(1.85rem,1.1rem+4.2vw,4.35rem)] leading-[1.12] font-medium tracking-[-0.03em] text-balance text-white"
          >
            We came as students. We leave as The Algorithm.
          </h1>
          <p className="mt-5 max-w-xl text-[clamp(0.95rem,0.85rem+0.5vw,1.125rem)] leading-relaxed text-white/78 sm:mt-6">
            The FUPRE Class of 2026 — remembered together.
          </p>
        </div>
      </div>
    </section>
  );
}
