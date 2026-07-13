"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { EditorialIntro } from "@/components/editorial-intro";

export function HomeOpening() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLButtonElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      const copy = copyRef.current;
      const cue = cueRef.current;
      const intro = introRef.current;

      if (!track || !stage || !card || !media || !copy || !cue || !intro) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const compactCard = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const width =
          viewportWidth < 640
            ? Math.min(viewportWidth * 0.84, 420)
            : viewportWidth < 1024
              ? Math.min(viewportWidth * 0.52, 440)
              : Math.min(viewportWidth * 0.255, 400);

        return {
          width,
          height: width * 0.56,
          top: Math.max(viewportHeight * (viewportWidth < 640 ? 0.12 : 0.1), 56),
        };
      };

      const context = gsap.context(() => {
        gsap.set(media, {
          scale: 1.04,
          transformOrigin: "50% 50%",
        });
        gsap.set(intro, {
          autoAlpha: 0,
          y: 36,
        });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.65,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => {
              const cueIsHidden = progress > 0.08;
              cue.tabIndex = cueIsHidden ? -1 : 0;
              cue.setAttribute("aria-hidden", String(cueIsHidden));
              intro.setAttribute("aria-hidden", String(progress < 0.2));
            },
          },
        });

        timeline
          .to(
            stage,
            {
              height: "100svh",
              backgroundColor: "#000000",
              duration: 0.14,
            },
            0,
          )
          .to(
            copy,
            {
              autoAlpha: 0,
              y: -42,
              duration: 0.12,
            },
            0,
          )
          .to(
            cue,
            {
              autoAlpha: 0,
              y: -14,
              duration: 0.08,
            },
            0,
          )
          .to(
            card,
            {
              top: () => compactCard().top,
              left: "50%",
              width: () => compactCard().width,
              height: () => compactCard().height,
              xPercent: -50,
              borderRadius: () => (window.innerWidth < 640 ? 18 : 22),
              duration: 0.5,
              ease: "power2.inOut",
            },
            0.06,
          )
          .to(
            media,
            {
              scale: 1,
              duration: 0.5,
              ease: "power2.inOut",
            },
            0.06,
          )
          .to(
            intro,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out",
            },
            0.25,
          )
          .to(intro, { autoAlpha: 1, duration: 0.27 }, 0.55);
      }, track);

      const refreshFrame = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      cleanupAnimation = () => {
        window.cancelAnimationFrame(refreshFrame);
        cue.tabIndex = 0;
        cue.removeAttribute("aria-hidden");
        intro.setAttribute("aria-hidden", "true");
        context.revert();
      };
    }

    void mountAnimation();

    return () => {
      cancelled = true;
      cleanupAnimation?.();
    };
  }, []);

  return (
    <section
      ref={trackRef}
      data-hero-track
      className="relative h-[240svh] bg-black"
    >
      <div
        ref={stageRef}
        data-hero-stage
        className="sticky top-0 h-[calc(100svh-var(--nav-height))] w-full overflow-hidden bg-white will-change-[height,background-color]"
      >
        <div
          ref={cardRef}
          data-hero-card
          className="absolute top-2 left-2 z-10 isolate h-[calc(100%-1rem)] w-[calc(100%-1rem)] overflow-hidden rounded-2xl will-change-[top,left,width,height,transform,border-radius] sm:top-3 sm:left-3 sm:h-[calc(100%-1.5rem)] sm:w-[calc(100%-1.5rem)] sm:rounded-[1.35rem] md:top-4 md:left-4 md:h-[calc(100%-2rem)] md:w-[calc(100%-2rem)] md:rounded-[1.75rem]"
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
              sizes="(max-width: 639px) 84vw, (max-width: 1023px) 52vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.58)_45%,rgba(0,0,0,0.72)_100%)]"
          />

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

          <button
            ref={cueRef}
            type="button"
            onClick={() => {
              const track = trackRef.current;
              if (!track) return;

              window.scrollTo({
                top: track.offsetTop + window.innerHeight * 0.92,
                behavior: "smooth",
              });
            }}
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
          </button>
        </div>

        <div
          ref={introRef}
          aria-hidden="true"
          className="invisible absolute inset-0 z-20 opacity-0 will-change-transform"
        >
          <EditorialIntro forceReveal variant="stage" />
        </div>
      </div>
    </section>
  );
}
