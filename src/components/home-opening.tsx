"use client";

import Image from "next/image";
import { TransitionLink as Link } from "@/components/transition-link";
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
  const storyRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const lineOverlayRef = useRef<SVGSVGElement>(null);

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
      const story = storyRef.current;
      const layers = layersRef.current;
      const lineOverlay = lineOverlayRef.current;

      if (
        !track ||
        !stage ||
        !card ||
        !media ||
        !copy ||
        !cue ||
        !intro ||
        !story ||
        !layers ||
        !lineOverlay
      ) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const compactCard = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const width =
          viewportWidth < 640
            ? Math.min(viewportWidth * 0.8, 350)
            : viewportWidth < 1024
              ? Math.min(viewportWidth * 0.45, 380)
              : Math.min(viewportWidth * 0.22, 330);

        return {
          width,
          height: width * 0.56,
          top: Math.max(viewportHeight * (viewportWidth < 640 ? 0.05 : 0.04), 16),
        };
      };

      const storyCard = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (viewportWidth < 768) {
          const width = Math.min(viewportWidth * 0.86, 400);
          return {
            width,
            height: width * 0.58,
            top: `${Math.max(viewportHeight * 0.04, 16)}px`,
            left: "50%",
            xPercent: -50,
            yPercent: 0,
          };
        }

        const width =
          viewportWidth < 1280
            ? Math.min(viewportWidth * 0.45, 540)
            : Math.min(viewportWidth * 0.44, 640);

        return {
          width,
          height: width * 0.62,
          top: "50%",
          left: viewportWidth < 1280 ? "68%" : "66%",
          xPercent: -50,
          yPercent: -50,
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
        gsap.set(story, {
          autoAlpha: 0,
          y: 32,
        });
        gsap.set(layers, {
          autoAlpha: 0,
          top: () => compactCard().top,
          left: "50%",
          width: () => compactCard().width,
          height: () => compactCard().height,
          xPercent: -50,
          yPercent: 0,
          transformOrigin: "50% 50%",
        });
        gsap.set(lineOverlay, {
          autoAlpha: 0,
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
              intro.setAttribute(
                "aria-hidden",
                String(progress < 0.14 || progress > 0.64),
              );
              story.setAttribute("aria-hidden", String(progress < 0.55));
            },
          },
        });

        timeline
          .to(
            stage,
            {
              backgroundColor: "#000000",
              duration: 0.45,
              ease: "power2.inOut",
            },
            0.06,
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
              yPercent: 0,
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
          .to(intro, { autoAlpha: 1, duration: 0.27 }, 0.55)
          .to(
            intro,
            {
              autoAlpha: 0,
              y: -30,
              duration: 0.16,
              ease: "power2.in",
            },
            0.82,
          )
          .to(
            card,
            {
              top: () => storyCard().top,
              left: () => storyCard().left,
              width: () => storyCard().width,
              height: () => storyCard().height,
              xPercent: () => storyCard().xPercent,
              yPercent: () => storyCard().yPercent,
              borderRadius: () => (window.innerWidth < 640 ? 18 : 24),
              duration: 0.44,
              ease: "power2.inOut",
            },
            0.82,
          )
          .to(
            layers,
            {
              top: () => storyCard().top,
              left: () => storyCard().left,
              width: () => storyCard().width,
              height: () => storyCard().height,
              xPercent: () => storyCard().xPercent,
              yPercent: () => storyCard().yPercent,
              autoAlpha: 1,
              duration: 0.44,
              ease: "power2.inOut",
            },
            0.82,
          )
          .to(
            story,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.32,
              ease: "power2.out",
            },
            0.92,
          )
          .to(
            lineOverlay,
            {
              autoAlpha: 1,
              duration: 0.28,
              ease: "power2.out",
            },
            0.96,
          )
          .to(story, { autoAlpha: 1, duration: 0.36 }, 1.24);
      }, track);

      const refreshFrame = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      cleanupAnimation = () => {
        window.cancelAnimationFrame(refreshFrame);
        cue.tabIndex = 0;
        cue.removeAttribute("aria-hidden");
        intro.setAttribute("aria-hidden", "true");
        story.setAttribute("aria-hidden", "true");
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
      className="relative h-[420svh] bg-black"
    >
      {/* White cover at the bottom of the track so the black doesn't bleed into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-[100svh] bg-white" />
      <span id="class" aria-hidden="true" className="absolute top-[330svh]" />
      <div
        ref={stageRef}
        data-hero-stage
        className="sticky top-[var(--nav-height)] h-[calc(100vh-var(--nav-height))] w-full overflow-hidden bg-white will-change-[background-color]"
      >
        <div
          ref={layersRef}
          aria-hidden="true"
          className="invisible pointer-events-none absolute z-[5] opacity-0 will-change-[top,left,width,height,transform]"
        >
          <div className="absolute inset-[-5%] rounded-[1.6rem] border border-white/12" />
          <div className="absolute inset-[-8%_-3%_-3%_-8%] -rotate-[2.5deg] rounded-[1.6rem] border border-white/18" />
          <div className="absolute inset-[-3%_-8%_-8%_-3%] rotate-[3deg] rounded-[1.6rem] border border-white/9" />
          <div className="absolute inset-[-2%] rounded-[1.4rem] border border-white/8" />
          <span className="absolute -top-3 -left-3 h-1.5 w-1.5 rounded-full bg-white/45" />
          <span className="absolute -bottom-3 -right-3 h-1.5 w-1.5 rounded-full bg-white/25" />
        </div>

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
              src="/images/hero-bg.webp"
              alt="The Algorithm Class of 2026 gathered in front of the College of Science building"
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

          <svg
            ref={lineOverlayRef}
            aria-hidden="true"
            viewBox="0 0 800 450"
            preserveAspectRatio="none"
            className="invisible absolute inset-0 z-[2] h-full w-full opacity-0 mix-blend-screen"
          >
            <g fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="1.2">
              <path d="M-40 382C118 334 218 338 332 284c116-55 182-41 264-101 76-55 135-58 252-68" />
              <path d="M-35 407c165-54 275-50 385-103 108-52 173-34 264-98 77-53 141-57 238-64" opacity=".68" />
              <path d="M-28 430c180-51 280-50 402-107 106-49 171-28 264-93 68-47 122-55 208-61" opacity=".38" />
              <path d="M55 0v450M205 0v450M355 0v450M505 0v450M655 0v450" opacity=".16" />
              <path d="M0 75h800M0 225h800M0 375h800" opacity=".16" />
              <circle cx="596" cy="183" r="4" fill="rgba(255,255,255,.72)" stroke="none" />
              <circle cx="333" cy="284" r="3" fill="rgba(255,255,255,.55)" stroke="none" />
            </g>
          </svg>

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
                The FUPRE Class of 2026 - remembered together.
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

        <div
          ref={storyRef}
          aria-hidden="true"
          className="invisible absolute inset-0 z-20 border-b border-white/75 opacity-0 will-change-transform"
        >
          <section
            aria-labelledby="class-story-heading"
            className="relative flex h-full items-end px-6 pb-6 text-white sm:px-10 sm:pb-8 md:items-center md:px-[9.5vw] md:pb-0"
          >
            <div className="w-full max-w-[22rem] md:translate-y-[3svh]">
              <p className="text-[0.68rem] font-medium tracking-[0.2em] text-white/68 uppercase sm:text-[0.72rem]">
                The class
              </p>
              <h2
                id="class-story-heading"
                className="mt-4 font-display text-[clamp(2rem,1.45rem+1.7vw,2.85rem)] leading-[1.04] font-medium tracking-[-0.04em] text-balance"
              >
                The people behind the Algorithm.
              </h2>
              <p className="mt-5 max-w-[21rem] text-sm leading-6 text-white/72 sm:text-[0.95rem] sm:leading-7">
                A graduating class shaped by late nights, shared deadlines,
                inside jokes, and the courage to keep building. Every name
                carries a part of the story.
              </p>

              <Link
                href="/graduates"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#123f31] px-5 text-[0.72rem] font-medium tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#195542] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-7"
              >
                Meet the graduates
              </Link>

              <div
                aria-label="Class markers"
                className="mt-7 grid grid-cols-4 border-t border-white/16 pt-4 text-[0.55rem] font-medium tracking-[0.12em] text-white/36 uppercase sm:mt-9 sm:text-[0.6rem]"
              >
                <span>One class</span>
                <span>Many paths</span>
                <span className="text-center">2026</span>
                <span className="text-right">FUPRE</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
