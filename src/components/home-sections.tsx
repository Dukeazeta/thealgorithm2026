"use client";

import Image from "next/image";
import { TransitionLink as Link } from "@/components/transition-link";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const archiveLanes = [
  { number: "01", label: "Campus" },
  { number: "02", label: "Classrooms" },
  { number: "03", label: "Events" },
  { number: "04", label: "Friendships" },
] as const;

const storyChapters = [
  {
    number: "01",
    eyebrow: "The beginning",
    title: "Where the paths met.",
    body: "Different people, different places, one department. This is where individual journeys became a shared class story.",
    tone: "light",
  },
  {
    number: "02",
    eyebrow: "The middle",
    title: "What shaped the class.",
    body: "The work, the pressure, the humour, and the people who made every demanding season easier to carry.",
    tone: "blue",
  },
  {
    number: "03",
    eyebrow: "The next chapter",
    title: "What we take with us.",
    body: "A record of who we became together, and a starting point for every path that opens after 2026.",
    tone: "dark",
  },
] as const;

const acknowledgementGroups = [
  "Lecturers",
  "Class representatives",
  "Contributors",
  "Families and friends",
] as const;

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        d="M3.75 9h10.5M10 4.75 14.25 9 10 13.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Decorative variant retained for future editorial tiles.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StoryGraphic({
  number,
  tone,
}: {
  number: string;
  tone: "light" | "blue" | "dark";
}) {
  const stroke =
    tone === "dark" ? "rgba(255,255,255,.42)" : "rgba(9,9,9,.34)";
  const softStroke =
    tone === "dark" ? "rgba(255,255,255,.15)" : "rgba(9,9,9,.12)";

  if (number === "01") {
    return (
      <svg aria-hidden="true" viewBox="0 0 420 250" className="h-full w-full">
        <g fill="none" strokeLinecap="round">
          <path
            d="M24 211c82-109 178-109 254-33 43 42 81 44 119 16"
            stroke={stroke}
            strokeWidth="1.4"
          />
          <path
            d="M28 230c83-93 171-89 244-24 47 42 88 43 124 22"
            stroke={softStroke}
          />
          <path d="M74 27v178M208 27v178M342 27v178" stroke={softStroke} />
          <circle cx="209" cy="143" r="7" fill={stroke} stroke="none" />
          <circle cx="209" cy="143" r="18" stroke={stroke} strokeWidth="1.2" />
        </g>
      </svg>
    );
  }

  if (number === "02") {
    return (
      <svg aria-hidden="true" viewBox="0 0 420 250" className="h-full w-full">
        <g fill="none" stroke={stroke} strokeWidth="1.2">
          <circle cx="210" cy="125" r="88" />
          <circle cx="210" cy="125" r="62" opacity=".72" />
          <circle cx="210" cy="125" r="35" opacity=".46" />
          <path d="M14 125h392M210 12v226" stroke={softStroke} />
          <path d="m148 187 124-124M148 63l124 124" stroke={softStroke} />
          <circle cx="272" cy="63" r="5" fill={stroke} stroke="none" />
        </g>
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 420 250" className="h-full w-full">
      <g fill="none" strokeLinecap="round">
        <path
          d="M-10 205c74-14 89-80 161-77 55 2 62 45 113 39 45-6 64-61 166-52"
          stroke={stroke}
          strokeWidth="1.4"
        />
        <path
          d="M-8 225c79-14 97-72 165-69 49 2 62 39 111 33 52-6 65-58 166-51"
          stroke={softStroke}
        />
        <path
          d="M-8 245c84-13 105-65 170-62 46 2 59 35 108 30 57-7 73-54 166-50"
          stroke={softStroke}
        />
        <path d="M45 24h330M45 78h330M45 132h330M45 186h330" stroke={softStroke} />
        <circle cx="264" cy="167" r="6" fill={stroke} stroke="none" />
      </g>
    </svg>
  );
}

function ContourField() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 760 660"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <rect width="760" height="660" fill="#b8aa9c" />
      <g fill="none" stroke="rgba(19,17,15,.34)" strokeWidth="1.2">
        <path d="M-45 512c97-73 185-81 274-31 90 50 131 28 214-45 84-74 162-63 350-2" />
        <path d="M-38 538c102-69 190-74 278-27 91 48 139 25 218-44 88-76 170-59 340 1" />
        <path d="M-31 565c108-66 198-68 286-24 92 46 144 22 221-43 91-77 178-53 328 3" />
        <path d="M-23 592c114-61 207-61 295-20 94 43 151 18 225-43 92-75 185-46 313 7" />
        <path d="M-16 619c120-56 217-53 306-16 95 40 157 14 228-42 94-73 192-38 298 10" />
        <path d="M95-20c-19 106 13 176 94 214 82 39 111 93 95 174-15 79 13 133 95 184" opacity=".5" />
        <path d="M132-20c-15 99 16 165 91 202 80 39 108 94 94 169-14 73 13 124 88 171" opacity=".32" />
        <path d="M170-20c-11 91 18 154 88 190 77 39 105 94 92 165-12 66 14 115 81 158" opacity=".2" />
        <circle cx="443" cy="436" r="8" fill="rgba(19,17,15,.52)" stroke="none" />
        <circle cx="443" cy="436" r="22" />
      </g>
      <g
        fill="rgba(19,17,15,.52)"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        letterSpacing="2"
      >
        <text x="48" y="55">FUPRE</text>
        <text x="626" y="610">2026</text>
      </g>
    </svg>
  );
}

export function HomeSections() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      // 1. Memories Header
      gsap.from(".memories-header > *", {
        scrollTrigger: { trigger: ".memories-header", start: "top 85%", toggleActions: "play reverse play reverse" },
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out"
      });

      // 2. Memories Hero Image Reveal
      gsap.fromTo(".memories-figure", 
        { clipPath: "inset(15% 5% 15% 5% round 1.5rem)" }, 
        { 
          clipPath: "inset(0% 0% 0% 0% round 1.5rem)", 
          duration: 1.5, 
          ease: "expo.inOut",
          scrollTrigger: { trigger: ".memories-figure", start: "top 85%", toggleActions: "play reverse play reverse" } 
        }
      );

      // 3. Memories Archive Lanes
      gsap.from(".archive-lane", {
        scrollTrigger: { trigger: ".archive-lanes-container", start: "top 85%", toggleActions: "play reverse play reverse" },
        x: -30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out"
      });

      // 4. Story Chapters
      gsap.utils.toArray<HTMLElement>(".story-chapter").forEach((chapter) => {
        gsap.from(chapter.querySelectorAll(".story-col"), {
          scrollTrigger: { trigger: chapter, start: "top 85%", toggleActions: "play reverse play reverse" },
          y: 40,
          opacity: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "expo.out"
        });
      });

      // 5. Class Notes Bento
      gsap.from(".bento-tile", {
        scrollTrigger: { trigger: ".bento-grid", start: "top 80%", toggleActions: "play reverse play reverse" },
        y: 100,
        opacity: 0,
        rotation: 2,
        scale: 0.9,
        duration: 1.2,
        stagger: { amount: 0.4, grid: "auto", from: "start" },
        ease: "back.out(1.2)"
      });
      
      gsap.to(".bento-img", {
        scrollTrigger: { trigger: ".bento-img", start: "top bottom", end: "bottom top", scrub: true },
        scale: 1.15,
        ease: "none"
      });

      // 6. Acknowledgements
      gsap.from(".ack-heading", {
        scrollTrigger: { trigger: ".ack-heading", start: "top 85%", toggleActions: "play reverse play reverse" },
        y: 120,
        opacity: 0,
        skewY: 4,
        duration: 1.5,
        ease: "expo.out"
      });
      
      gsap.from(".ack-group", {
        scrollTrigger: { trigger: ".ack-lists", start: "top 85%", toggleActions: "play reverse play reverse" },
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out"
      });

      // 7. Closing
      gsap.from(".closing-content > *", {
        scrollTrigger: { trigger: ".closing-content", start: "top 85%", toggleActions: "play reverse play reverse" },
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out"
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <section
        id="memories"
        aria-labelledby="memories-heading"
        className="scroll-mt-6 bg-[#efeee8] px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40"
      >
        <div className="mx-auto max-w-[96rem]">
          <header className="memories-header grid gap-8 border-t border-black/15 pt-5 md:grid-cols-12 md:gap-6">
            <p className="text-[0.68rem] font-medium tracking-[0.18em] text-black/55 uppercase md:col-span-3">
              The memories
            </p>
            <div className="md:col-span-8 md:col-start-5">
              <h2
                id="memories-heading"
                className="max-w-4xl font-display text-[clamp(2.65rem,1.65rem+4.25vw,6.5rem)] leading-[0.94] font-medium tracking-[-0.055em] text-balance"
              >
                The moments we get to keep.
              </h2>
              <p className="mt-7 max-w-xl text-base leading-7 text-black/60 sm:mt-9 sm:text-lg sm:leading-8">
                The gallery is the visual memory of the class: the ordinary
                days, big occasions, and unplanned moments that explain what
                the final certificate cannot.
              </p>
            </div>
          </header>

          <div className="mt-16 grid gap-4 lg:mt-24 lg:grid-cols-[1.58fr_0.92fr]">
            <figure className="memories-figure group relative min-h-[30rem] overflow-hidden rounded-[1.5rem] bg-black sm:min-h-[40rem] sm:rounded-[2rem] lg:min-h-[52rem]">
              <Image
                src="/images/hero-bg.webp"
                alt="The Algorithm Class of 2026 gathered in front of the College of Computing building"
                fill
                sizes="(max-width: 1023px) calc(100vw - 2rem), 61vw"
                className="object-cover object-center transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.12)_42%,rgba(0,0,0,.78))]"
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[0.65rem] font-medium tracking-[0.15em] text-white/82 uppercase sm:p-7">
                <span>Archive / 2026</span>
                <span>FUPRE</span>
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9 lg:p-11">
                <p className="text-[0.68rem] font-medium tracking-[0.18em] text-white/68 uppercase">
                  The first frame
                </p>
                <p className="mt-3 max-w-xl font-display text-[clamp(1.85rem,1.3rem+2vw,3.5rem)] leading-[1.03] tracking-[-0.04em] text-balance">
                  A class remembered in more than names and results.
                </p>
              </figcaption>
            </figure>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="flex min-h-[22rem] flex-col justify-between rounded-[1.5rem] bg-[#123f31] p-6 text-white sm:min-h-[26rem] sm:rounded-[2rem] sm:p-8 lg:min-h-0 lg:p-10">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[0.65rem] font-medium tracking-[0.16em] text-white/68 uppercase">
                    A living archive
                  </p>
                  <span className="h-2 w-2 rounded-full bg-[#d7ff5a]" />
                </div>
                <div>
                  <p className="max-w-md font-display text-[clamp(1.8rem,1.3rem+1.6vw,3rem)] leading-[1.02] tracking-[-0.04em]">
                    Built to grow as the real photographs and captions arrive.
                  </p>
                  <p className="mt-5 max-w-sm text-sm leading-6 text-white/68 sm:text-base sm:leading-7">
                    Every image will keep its context: who, where, and why the
                    moment mattered.
                  </p>
                </div>
              </article>

              {/* Archive Lanes — flat list, no card wrapper */}
              <div className="archive-lanes-container flex flex-col justify-between p-1 sm:p-2 lg:p-4">
                <p className="text-[0.65rem] font-medium tracking-[0.16em] text-black/48 uppercase">
                  Archive lanes
                </p>
                <div className="mt-6 border-t border-black/12">
                  {archiveLanes.map((lane) => (
                    <div
                      key={lane.number}
                      className="archive-lane grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-black/12 py-4"
                    >
                      <span className="text-[0.64rem] font-medium tracking-[0.12em] text-black/38">
                        {lane.number}
                      </span>
                      <span className="text-sm font-medium sm:text-base">
                        {lane.label}
                      </span>
                      <span aria-hidden="true" className="text-black/30">
                        +
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/story"
                  className="group mt-8 inline-flex min-h-11 items-center gap-3 text-[0.72rem] font-medium tracking-[0.1em] uppercase"
                >
                  Continue the story
                  <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="story"
        aria-labelledby="story-heading"
        className="scroll-mt-6 bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40"
      >
        <div className="mx-auto max-w-[96rem]">
          <header className="grid gap-8 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-8">
              <p className="text-[0.68rem] font-medium tracking-[0.18em] text-black/48 uppercase">
                The class story
              </p>
              <h2
                id="story-heading"
                className="mt-6 max-w-4xl font-display text-[clamp(2.65rem,1.65rem+4.25vw,6.5rem)] leading-[0.94] font-medium tracking-[-0.055em] text-balance"
              >
                How we got here.
              </h2>
            </div>
            <div className="flex items-end md:col-span-3 md:col-start-10">
              <p className="max-w-sm text-base leading-7 text-black/60 sm:text-lg sm:leading-8">
                Not a list of dates. A record of the seasons that changed a
                group of students into a graduating class.
              </p>
            </div>
          </header>

          {/* Flat editorial chapter rows with dividers */}
          <div className="mt-14 divide-y divide-black/10 border-t border-black/10 md:mt-20">
            {storyChapters.map((chapter) => (
              <article
                key={chapter.number}
                className="story-chapter grid gap-4 py-10 sm:py-14 md:grid-cols-12 md:gap-6 md:py-16"
              >
                <div className="story-col flex items-start justify-between md:col-span-3 md:flex-col md:gap-3">
                  <p className="text-[0.64rem] font-medium tracking-[0.16em] text-black/48 uppercase">
                    {chapter.eyebrow}
                  </p>
                  <span className="text-[0.64rem] font-medium tracking-[0.12em] text-black/35">
                    {chapter.number}
                  </span>
                </div>
                <div className="story-col md:col-span-5 md:col-start-5">
                  <h3 className="font-display text-[clamp(1.7rem,1.35rem+1.2vw,2.65rem)] leading-[1.03] tracking-[-0.04em] text-balance">
                    {chapter.title}
                  </h3>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-black/58 sm:text-base sm:leading-7">
                    {chapter.body}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-end border-t border-black/12 pt-5 sm:mt-16">
            <Link
              href="#acknowledgements"
              className="group inline-flex min-h-11 items-center gap-3 text-[0.72rem] font-medium tracking-[0.1em] uppercase"
            >
              The people who carried us
              <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="class-notes"
        aria-labelledby="class-notes-heading"
        className="overflow-hidden bg-white py-20 sm:py-28 lg:py-32"
      >
        <div className="mx-auto max-w-[76rem] px-4 sm:px-6 lg:px-8">
          <h2
            id="class-notes-heading"
            className="mx-auto max-w-5xl text-center font-display text-[clamp(2.5rem,1.65rem+3.5vw,4.5rem)] leading-[1.02] font-medium tracking-[-0.055em] text-balance"
          >
            From the classroom to the world.
            <br />
            Stories from our class.
          </h2>
        </div>

        <div className="bento-grid mt-16 grid grid-cols-1 gap-px bg-black/10 sm:mt-24 sm:auto-rows-[7.5rem] sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[4.65rem] border-y border-black/10">
            <article className="bento-tile flex min-h-[16rem] flex-col justify-end bg-[#f0efeb] p-5 sm:col-span-1 sm:row-span-2 lg:col-span-2 lg:row-span-4 lg:min-h-0">
              <p className="font-display text-[clamp(1.8rem,1.25rem+1.5vw,2.7rem)] leading-[1.05] tracking-[-0.045em]">
                The people behind the final result
              </p>
            </article>

            <article className="bento-tile group relative min-h-[22rem] overflow-hidden bg-[#153f30] text-white sm:row-span-3 lg:col-span-2 lg:row-span-5 lg:min-h-0">
              <Image
                src="/images/hero-bg.webp"
                alt="The Algorithm Class of 2026 gathered in front of the College of Computing building"
                fill
                sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 38rem"
                className="bento-img object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.66))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="font-display text-[clamp(1.8rem,1.4rem+1.25vw,2.5rem)] leading-[1.06] tracking-[-0.04em] text-balance">
                  The place where our paths became one story
                </p>
              </div>
            </article>

            <article className="bento-tile flex min-h-[17rem] flex-col bg-[#f0efeb] p-4 sm:row-span-2 lg:col-span-2 lg:row-span-2 lg:min-h-0 lg:p-5">
              <div className="mb-4 flex flex-1 items-center justify-center overflow-hidden bg-[#d6dbe1]">
                <svg aria-hidden="true" viewBox="0 0 360 130" className="h-full w-full">
                  <g fill="none" stroke="rgba(10,10,10,.32)">
                    <path d="M-20 103c65-73 120-72 177-17s111 44 223-21" />
                    <path d="M-20 119c69-65 124-62 180-12s112 38 222-10" opacity=".45" />
                    <circle cx="158" cy="86" r="7" fill="rgba(10,10,10,.45)" stroke="none" />
                  </g>
                </svg>
              </div>
              <p className="text-base leading-snug font-medium tracking-[-0.025em]">
                The ordinary days we will miss the most
              </p>
            </article>

            <article className="bento-tile flex min-h-[17rem] flex-col justify-between bg-[#cad8e1] p-5 sm:row-span-2 lg:row-span-3 lg:min-h-0">
              <p className="text-[0.64rem] font-medium tracking-[0.16em] text-black/45 uppercase">
                Class record / 02
              </p>
              <p className="font-display text-2xl leading-[1.08] tracking-[-0.04em]">
                What the hard seasons taught us
              </p>
            </article>

            <article className="bento-tile flex min-h-[17rem] flex-col justify-between bg-[#d3c3b2] p-5 sm:row-span-2 lg:row-span-3 lg:min-h-0">
              <p className="text-[0.64rem] font-medium tracking-[0.16em] text-black/45 uppercase">
                Class record / 03
              </p>
              <p className="font-display text-2xl leading-[1.08] tracking-[-0.04em]">
                The friendships that carried the work
              </p>
            </article>

            <article className="bento-tile relative flex min-h-[17rem] items-end overflow-hidden bg-[#0c0d0d] p-5 text-white sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2 lg:min-h-0">
              <div className="absolute inset-0 opacity-60">
                <ContourField />
              </div>
              <div className="absolute inset-0 bg-black/42" />
              <p className="relative max-w-md font-display text-[clamp(1.65rem,1.25rem+1vw,2.35rem)] leading-[1.06] tracking-[-0.04em]">
                The next chapter starts with everything we became here
              </p>
            </article>
          </div>
      </section>

      <section
        id="acknowledgements"
        aria-labelledby="acknowledgements-heading"
        className="scroll-mt-6 bg-[#123f31] px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8 lg:py-36"
      >
        <div className="mx-auto max-w-[96rem]">
          <div className="relative min-h-[44rem] overflow-hidden lg:min-h-[48rem]">
            <div className="relative z-10 flex min-h-[calc(44rem-3rem)] flex-col lg:min-h-[calc(48rem-7rem)]">
              <div className="flex items-start justify-between gap-5">
                <p className="text-[0.65rem] font-medium tracking-[0.18em] text-white/68 uppercase">
                  Acknowledgements
                </p>
                <Image
                  src="/images/nacos-logo.jpg"
                  alt="NACOS"
                  width={56}
                  height={56}
                  className="h-12 w-12 rounded-full object-cover ring-1 ring-white/20 sm:h-14 sm:w-14"
                />
              </div>

              <div className="my-auto py-16">
                <h2
                  id="acknowledgements-heading"
                  className="ack-heading max-w-6xl font-display text-[clamp(3.25rem,1.3rem+8vw,10.5rem)] leading-[0.84] font-medium tracking-[-0.07em] text-balance"
                >
                  Nobody gets here alone.
                </h2>
              </div>

              <div className="ack-lists grid gap-8 border-t border-white/18 pt-6 md:grid-cols-12">
                <p className="ack-group max-w-lg text-sm leading-6 text-white/68 sm:text-base sm:leading-7 md:col-span-5">
                  This yearbook makes room for the people whose teaching,
                  patience, leadership, work, and belief helped the class reach
                  this point.
                </p>
                <div className="grid grid-cols-2 gap-x-5 gap-y-3 md:col-span-6 md:col-start-7">
                  {acknowledgementGroups.map((group, index) => (
                    <p
                      key={group}
                      className="ack-group border-t border-white/14 pt-3 text-[0.72rem] font-medium tracking-[0.05em] text-white/76"
                    >
                      <span className="mr-2 text-white/34">
                        0{index + 1}
                      </span>
                      {group}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="closing"
        aria-labelledby="closing-heading"
        className="bg-[#d3c3b2]"
      >
        <div className="mx-auto grid min-h-[45rem] max-w-[96rem] overflow-hidden lg:grid-cols-[1.04fr_0.96fr]">
          <div className="closing-content flex flex-col justify-between p-6 sm:p-10 lg:p-14">
            <p className="text-[0.65rem] font-medium tracking-[0.18em] text-black/52 uppercase">
              The Algorithm 26
            </p>
            <div className="py-20 lg:py-14">
              <h2
                id="closing-heading"
                className="max-w-3xl font-display text-[clamp(3rem,1.7rem+4.8vw,7rem)] leading-[0.9] font-medium tracking-[-0.06em] text-balance"
              >
                The chapter ends. The story does not.
              </h2>
              <p className="mt-7 max-w-lg text-base leading-7 text-black/60 sm:mt-9 sm:text-lg sm:leading-8">
                A place to return to the people, memories, and shared journey
                that made the FUPRE Class of 2026 ours.
              </p>
            </div>
            <div className="flex flex-col gap-3 border-t border-black/18 pt-6 sm:flex-row sm:items-center">
              <Link
                href="/graduates"
                className="inline-flex min-h-12 items-center justify-center rounded-sm bg-black px-6 text-[0.72rem] font-medium tracking-[0.1em] text-white uppercase transition-colors hover:bg-black/80"
              >
                Return to the class
              </Link>
              <Link
                href="#memories"
                className="group inline-flex min-h-12 items-center justify-center gap-3 px-4 text-[0.72rem] font-medium tracking-[0.1em] uppercase"
              >
                View the memories
                <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="min-h-[26rem] border-t border-black/12 lg:min-h-full lg:border-t-0 lg:border-l">
            <ContourField />
          </div>
        </div>
      </section>
    </div>
  );
}

const footerGroups = [
  {
    title: "Explore",
    links: [
      { href: "/graduates", label: "The class" },
      { href: "/gallery", label: "Gallery" },
      { href: "/story", label: "Our story" },
    ],
  },
  {
    title: "Yearbook",
    links: [
      { href: "/gallery", label: "Campus life" },
      { href: "/gallery", label: "Classrooms" },
      { href: "/gallery", label: "Events" },
      { href: "/gallery", label: "Friendships" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/#acknowledgements", label: "Lecturers" },
      { href: "/#acknowledgements", label: "Class representatives" },
      { href: "/#acknowledgements", label: "Contributors" },
    ],
  },
  {
    title: "The project",
    links: [
      { href: "/story", label: "About the archive" },
      { href: "/#acknowledgements", label: "Acknowledgements" },
      { href: "/gallery", label: "Contribute a memory" },
    ],
  },
] as const;

export function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".footer-word", {
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 85%",
          toggleActions: "play reverse play reverse",
        },
        opacity: 0,
        y: 40,
        rotateX: -45,
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="overflow-hidden bg-black px-4 pt-24 pb-6 text-white sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
      <div className="mx-auto max-w-[96rem]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12 md:gap-x-4 lg:gap-x-6">
          <Link
            href="/"
            aria-label="The Algorithm 26 home"
            className="col-span-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[0.58rem] font-bold tracking-[-0.04em] text-black md:col-span-1"
          >
            A26
          </Link>

          <nav
            aria-label="Footer"
            className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-12 md:col-span-11 md:grid-cols-4 md:gap-x-4 lg:gap-x-6"
          >
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="font-mono text-[0.68rem] tracking-[-0.01em] text-white/34 uppercase">
                  {group.title}
                </p>
                <ul className="mt-5 space-y-1">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="inline-block text-[0.94rem] leading-[1.45] font-semibold tracking-[-0.025em] text-white transition-colors hover:text-white/58"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <h2 ref={textRef} className="mt-24 max-w-[92rem] font-display text-[clamp(3.25rem,7.5vw,7.25rem)] leading-[0.9] font-medium tracking-[-0.065em] text-balance sm:mt-32">
          {["Every", "name.", "Every", "memory.", "One", "class", "story."].map((word, i) => (
            <span key={i} className="inline-block">
              <span className="footer-word inline-block origin-bottom-left">{word}</span>
              {i !== 6 && <span>&nbsp;</span>}
            </span>
          ))}
        </h2>

        <div className="mt-20 flex flex-col gap-8 font-mono text-[0.66rem] tracking-[-0.01em] text-white/34 uppercase sm:mt-28 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/8 font-sans text-[0.62rem] font-bold text-white/80">
            F26
          </div>
          <div className="space-y-2 sm:text-right">
            <p>Federal University of Petroleum Resources, Effurun</p>
            <p>© 2026 The Algorithm 26 · Digital yearbook</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
