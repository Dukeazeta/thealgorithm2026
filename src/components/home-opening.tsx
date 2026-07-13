"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { EditorialIntro } from "@/components/editorial-intro";

export function HomeOpening() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLAnchorElement>(null);
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

      if (
        !track ||
        !stage ||
        !card ||
        !media ||
        !copy ||
        !cue
      ) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: () => `+=${Math.max(window.innerHeight, 640)}`,
            scrub: 0.55,
            pin: stage,
            pinSpacing: false,
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
          .to(stage, { padding: 0, height: "100svh", duration: 0.38 }, 0)
          .to(card, { borderRadius: 0, duration: 0.38 }, 0)
          .to(media, { scale: 1.08, duration: 1 }, 0)
          .to(copy, { autoAlpha: 0, y: -40, duration: 0.32 }, 0.02)
          .to(cue, { autoAlpha: 0, y: -16, duration: 0.22 }, 0);
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
  }, []);

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
