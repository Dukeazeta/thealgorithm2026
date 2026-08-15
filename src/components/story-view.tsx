"use client";

import { TransitionLink as Link } from "@/components/transition-link";
import Image from "next/image";
import { useState } from "react";

type StoryChapter = {
  id: string;
  year: string;
  level: string;
  title: string;
  eyebrow: string;
  headline: string;
  narrative: string[];
  keyCourses: string[];
  definingMoment: string;
  quote: {
    text: string;
    author: string;
  };
  tone: "forest" | "slate" | "stone" | "dark";
};

const CHAPTERS: StoryChapter[] = [
  {
    id: "100L",
    year: "2021 / 2022",
    level: "100 Level",
    title: "The Genesis",
    eyebrow: "Orientation & First Code",
    headline: "Strangers gathered at the College of Computing.",
    narrative: [
      "We arrived with fresh admission letters, varied expectations, and diverse backgrounds from across the country. Our first lectures inside the College of Computing were packed to the brim.",
      "From Introduction to Computing and basic mathematics to writing our very first `printf('Hello, World!\\n');`, we slowly learned that Computer Science was less about typing and more about learning how to think.",
      "The confusion was mutual, the hall migrations under the hot sun were relentless, but in those crowded lecture halls, the first friendships of a lifetime took root.",
    ],
    keyCourses: ["CSC 101 · Intro to Computer Science", "MTH 110 · Algebra & Trigonometry", "PHY 101 · General Physics", "GST 111 · Communication Skills"],
    definingMoment: "The collective sigh of relief when our first C programming assignment compiled without segmentation fault.",
    quote: {
      text: "We started not knowing who would sit beside us for the next four years. Now, we can't imagine the journey without them.",
      author: "Class of '26 Archive Entry",
    },
    tone: "stone",
  },
  {
    id: "200L",
    year: "2022 / 2023",
    level: "200 Level",
    title: "The Crucible",
    eyebrow: "Data Structures & Core Systems",
    headline: "When code stopped being simple and became an art.",
    narrative: [
      "200 Level stripped away any lingering illusions. Pointers, binary search trees, object-oriented design, and discrete mathematics tested our resolve.",
      "Library tables were constantly filled with laptops, notebooks, and shared hot-spots. Study groups formed organically in hostel rooms and cafeteria corners at midnight.",
      "We weathered the dreaded test weeks and long lab sessions together. If one person finally understood recursion, five others were taught before dawn.",
    ],
    keyCourses: ["CSC 201 · Computer Programming II", "CSC 203 · Data Structures & Algorithms", "MTH 210 · Linear Algebra", "CSC 205 · Operating Systems I"],
    definingMoment: "The legendary 2 AM debugging sessions in hostel rooms trying to fix null pointer exceptions before 8 AM submission.",
    quote: {
      text: "Data structures broke our initial confidence, but rebuilt our problem-solving discipline.",
      author: "Class Memoir",
    },
    tone: "slate",
  },
  {
    id: "300L",
    year: "2023 / 2024",
    level: "300 Level",
    title: "The Expansion",
    eyebrow: "Industry, SIWES & Specialization",
    headline: "Stepping beyond lecture halls into real-world codebases.",
    narrative: [
      "300 Level was the bridge between academic theory and practical engineering. We dove deep into database systems, software engineering methodologies, web architecture, and artificial intelligence fundamentals.",
      "The mandatory SIWES industrial training took us into technology hubs, fintech startups, energy firms, and research laboratories across Nigeria.",
      "When we reconnected after internship, we were no longer just students passing exams — we were engineers, designers, security analysts, and tech founders with real-world scars and ambition.",
    ],
    keyCourses: ["CSC 301 · Database Management Systems", "CSC 303 · Software Engineering", "CSC 307 · Artificial Intelligence", "SIWES · Industrial Work Experience"],
    definingMoment: "Returning from SIWES with production deployments, startup ideas, and transformed perspectives.",
    quote: {
      text: "Internship taught us that the classroom gave us the foundation, but our collective hunger gave us the edge.",
      author: "SIWES Retrospective",
    },
    tone: "forest",
  },
  {
    id: "400L",
    year: "2024 / 2026",
    level: "400 Level",
    title: "The Algorithm",
    eyebrow: "Capstone Projects & Legacy",
    headline: "The final projects, the defence, and the legacy sealed.",
    narrative: [
      "Our final year was the culmination of every sacrifice. Final year project defence, late nights refining neural network architectures, distributed databases, and complex web ecosystems.",
      "From departmental elections to NACOS dinner celebrations, sign-out shirts, and the iconic class photograph in front of the College of Computing building, every day felt historic.",
      "We came as individual students seeking a degree. We walk out into the world as 'The Algorithm' — resilient, bonded, and ready to lead the future.",
    ],
    keyCourses: ["CSC 401 · Computer Networks & Security", "CSC 405 · Cloud Computing & Systems", "CSC 499 · Final Year Capstone Research", "CSC 411 · Machine Learning"],
    definingMoment: "Walking out of the project defence hall and stepping into the sign-out celebration with our classmates.",
    quote: {
      text: "We wrote code that worked, but more importantly, we wrote a story that will never be deleted.",
      author: "Graduation Creed",
    },
    tone: "dark",
  },
];

const MEMORIES = [
  {
    category: "Late Nights",
    title: "The 3 AM Lab Lights",
    snippet: "When the deadline was 8:00 AM, the lab didn't sleep. Snacks were shared, debugging tips were whispered, and playlists kept everyone alive.",
    author: "Lab 2 Regulars",
  },
  {
    category: "The Lectures",
    title: "Hall 3 Front Row Battles",
    snippet: "Rushing across campus at 7:45 AM to secure seats near the projector before the lecture began. If you arrived at 8:05 AM, you were taking notes from the doorway.",
    author: "Early Birds Group",
  },
  {
    category: "Inside Lore",
    title: "'It Works on My Machine'",
    snippet: "The universal excuse for every project demo that crashed the moment the lecturer touched the keyboard. A classic that united every software team.",
    author: "Project Group 4",
  },
  {
    category: "Milestones",
    title: "The White Shirt Sign-Out",
    snippet: "Covering each other's shirts with signatures, heartfelt notes, phone numbers, and inside jokes that only our department could decode.",
    author: "Signing-Out Day 2026",
  },
];

const STATS = [
  { label: "Academic Semesters", value: "8+" },
  { label: "Group Projects Built", value: "140+" },
  { label: "Lines of Code Deployed", value: "2.4M+" },
  { label: "Lifelong Friendships", value: "Forever" },
];

export function StoryView() {
  const [activeChapterId, setActiveChapterId] = useState<string>("100L");
  const currentChapter = CHAPTERS.find((c) => c.id === activeChapterId) || CHAPTERS[0];

  return (
    <div className="bg-[#efeee8] text-foreground">
      {/* Editorial Story Hero */}
      <section className="relative overflow-hidden bg-white px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8 lg:pt-32 lg:pb-36">
        <div className="mx-auto max-w-[96rem]">
          <div className="max-w-4xl">
            <p className="text-[0.68rem] font-medium tracking-[0.2em] text-muted uppercase">
              The Class Chronicle · 2021 — 2026
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.75rem,1.8rem+5vw,6.5rem)] leading-[0.94] font-medium tracking-[-0.055em] text-balance text-foreground">
              From first syntax to final defence.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-foreground/75 sm:text-lg sm:leading-8">
              The Algorithm is not just our class name — it is the sequence of
              decisions, trials, shared laughter, and collective endurance that
              turned strangers into an unbreakable family at FUPRE.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-black/10 pt-6 sm:mt-20">
            <Link
              href="#timeline"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-6 text-[0.8125rem] font-medium text-white transition-colors hover:bg-foreground/85"
            >
              Explore the 4-Year Journey
            </Link>
            <Link
              href="/gallery"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-black/15 bg-white px-6 text-[0.8125rem] font-medium text-foreground transition-colors hover:bg-black/[0.03]"
            >
              View Class Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Photo Milestone Banner */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[96rem]">
          <div className="relative min-h-[26rem] overflow-hidden rounded-[1.75rem] bg-black sm:min-h-[36rem] lg:min-h-[44rem]">
            <Image
              src="/images/hero-bg.webp"
              alt="The Algorithm Class of 2026 assembled at the College of Computing"
              fill
              priority
              sizes="(max-width: 1536px) 100vw, 1536px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.85)_100%)]" />
            
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6 text-[0.68rem] font-medium tracking-[0.16em] text-white/80 uppercase sm:p-8">
              <span>College of Computing · FUPRE</span>
              <span>The Algorithm 2026</span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14 text-white">
              <span className="inline-block rounded-md bg-white/15 px-3 py-1 text-[0.65rem] font-medium tracking-[0.14em] text-white/90 uppercase backdrop-blur-md">
                Historical Record
              </span>
              <h2 className="mt-4 max-w-3xl font-display text-[clamp(1.85rem,1.3rem+2.5vw,3.75rem)] leading-[1.04] tracking-[-0.04em] text-balance">
                Every face in this frame contributed to the story.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/78 sm:text-base">
                Gathered in front of the landmark College of Computing building,
                marking the culmination of an extraordinary academic passage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 4-Year Timeline Section */}
      <section id="timeline" className="scroll-mt-12 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-[96rem]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.68rem] font-medium tracking-[0.2em] text-muted uppercase">
                Chronological Chapters
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,1.5rem+3vw,4.5rem)] leading-[0.98] font-medium tracking-[-0.05em] text-balance">
                The Four Seasons of 2026.
              </h2>
            </div>

            {/* Level Switcher Pills */}
            <div className="flex flex-wrap gap-2 rounded-xl bg-black/[0.06] p-1.5 backdrop-blur-sm">
              {CHAPTERS.map((chapter) => {
                const isActive = chapter.id === activeChapterId;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => setActiveChapterId(chapter.id)}
                    className={`rounded-lg px-4 py-2.5 text-xs font-semibold tracking-[-0.01em] transition-all ${
                      isActive
                        ? "bg-foreground text-white shadow-sm"
                        : "text-foreground/70 hover:text-foreground hover:bg-black/5"
                    }`}
                  >
                    {chapter.level} · {chapter.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chapter Showcase Card */}
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-10 lg:mt-14 lg:p-14">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
              {/* Left Details Column */}
              <div className="flex flex-col justify-between lg:col-span-7">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-[#123f31] px-3 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-[#d7ff5a] uppercase">
                      {currentChapter.level}
                    </span>
                    <span className="text-xs font-medium text-muted">
                      {currentChapter.year}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-[clamp(2rem,1.5rem+2vw,3.5rem)] leading-[1.02] tracking-[-0.045em] text-balance text-foreground">
                    {currentChapter.headline}
                  </h3>

                  <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/80 sm:text-[1.05rem] sm:leading-8">
                    {currentChapter.narrative.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="mt-10 border-t border-black/10 pt-6">
                  <p className="text-[0.68rem] font-medium tracking-[0.18em] text-muted uppercase">
                    Defining Milestone
                  </p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-foreground sm:text-base">
                    {currentChapter.definingMoment}
                  </p>
                </div>
              </div>

              {/* Right Context & Courses Column */}
              <div className="flex flex-col justify-between rounded-2xl bg-[#f5f4ef] p-6 sm:p-8 lg:col-span-5">
                <div>
                  <p className="text-[0.68rem] font-medium tracking-[0.18em] text-muted uppercase">
                    Key Modules & Architecture
                  </p>
                  <div className="mt-5 space-y-2.5">
                    {currentChapter.keyCourses.map((course) => (
                      <div
                        key={course}
                        className="rounded-xl border border-black/8 bg-white p-3.5 text-xs font-medium text-foreground sm:text-sm"
                      >
                        {course}
                      </div>
                    ))}
                  </div>
                </div>

                <blockquote className="mt-8 border-l-2 border-[#123f31] pl-4">
                  <p className="font-display text-lg leading-snug tracking-[-0.025em] text-foreground sm:text-xl">
                    &ldquo;{currentChapter.quote.text}&rdquo;
                  </p>
                  <footer className="mt-3 text-xs font-semibold tracking-[0.08em] text-muted uppercase">
                    — {currentChapter.quote.author}
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Lore & Memoir Cards */}
      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-[96rem]">
          <div className="max-w-3xl">
            <p className="text-[0.68rem] font-medium tracking-[0.2em] text-muted uppercase">
              The Unwritten Rules
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,1.5rem+3vw,4.5rem)] leading-[0.98] font-medium tracking-[-0.05em] text-balance">
              The moments only we understand.
            </h2>
            <p className="mt-6 text-base text-foreground/75 sm:text-lg">
              Beyond the curriculum and grades, these are the real memories that
              defined our day-to-day experience.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MEMORIES.map((memory) => (
              <article
                key={memory.title}
                className="flex flex-col justify-between rounded-2xl border border-black/8 bg-[#f9f8f4] p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md sm:p-7"
              >
                <div>
                  <span className="inline-block text-[0.65rem] font-medium tracking-[0.16em] text-muted uppercase">
                    {memory.category}
                  </span>
                  <h3 className="mt-3 font-display text-xl leading-snug font-medium tracking-[-0.03em] text-foreground sm:text-2xl">
                    {memory.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/70">
                    {memory.snippet}
                  </p>
                </div>
                <p className="mt-8 border-t border-black/8 pt-3 text-[0.7rem] font-semibold text-muted">
                  Recorded by: {memory.author}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* By the Numbers Bento */}
      <section className="bg-[#123f31] px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <span className="text-[0.65rem] font-medium tracking-[0.2em] text-[#d7ff5a] uppercase">
                The Class Footprint
              </span>
              <h2 className="mt-4 font-display text-[clamp(2.5rem,1.8rem+3vw,4.5rem)] leading-[0.98] font-medium tracking-[-0.05em] text-balance">
                Four years distilled into milestones.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-white/75 sm:text-lg sm:leading-8">
                From the first line of syntax written in 100 Level to enterprise
                capstone solutions defended in 400 Level, our growth is measured
                in more than just course credits.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:col-span-7">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col justify-between rounded-2xl border border-white/12 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
                >
                  <p className="font-display text-[clamp(2.25rem,1.8rem+2vw,4rem)] leading-none font-bold tracking-tight text-[#d7ff5a]">
                    {stat.value}
                  </p>
                  <p className="mt-4 text-xs font-medium tracking-[0.08em] text-white/70 uppercase sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing Call to Action */}
      <section className="bg-white px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl">
          <p className="text-[0.68rem] font-medium tracking-[0.2em] text-muted uppercase">
            The Living Memorial
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,1.6rem+3vw,4rem)] leading-[1.02] font-medium tracking-[-0.045em] text-balance">
            Explore the faces, moments, and people behind the numbers.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/gallery"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-foreground px-8 text-sm font-medium text-white transition-colors hover:bg-foreground/85"
            >
              Browse Photo Gallery
            </Link>
            <Link
              href="/#class"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-black/15 bg-white px-8 text-sm font-medium text-foreground transition-colors hover:bg-black/[0.03]"
            >
              Meet the Graduates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
