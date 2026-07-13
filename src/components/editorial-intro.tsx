"use client";

import { useInViewOnce, usePrefersReducedMotion } from "@/hooks/use-home-scroll";

const STATEMENT_LINES = [
  "One class. Many paths.",
  "One story we get to keep.",
] as const;

type EditorialIntroProps = {
  forceReveal?: boolean;
};

export function EditorialIntro({ forceReveal = false }: EditorialIntroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, visible } = useInViewOnce<HTMLElement>(0.28);
  const revealed = forceReveal || visible || reducedMotion;

  return (
    <section
      ref={ref}
      id="introduction"
      aria-labelledby="introduction-heading"
      className="relative min-h-svh scroll-mt-[calc(var(--nav-height)+1rem)] bg-white px-6 py-28 sm:px-10 sm:py-36 md:px-16 md:py-44 lg:px-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-10 lg:col-span-9">
          <p
            className={`text-[0.7rem] font-medium tracking-[0.18em] text-muted uppercase transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-[0.75rem] ${
              revealed
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: revealed ? "0ms" : "0ms" }}
          >
            FUPRE · Class of 2026
          </p>

          <h2
            id="introduction-heading"
            className="mt-8 font-display text-[clamp(2rem,1.2rem+3.4vw,3.75rem)] leading-[1.12] font-medium tracking-[-0.03em] text-foreground sm:mt-10"
          >
            {STATEMENT_LINES.map((line, index) => (
              <span
                key={line}
                className="block overflow-hidden py-[0.08em]"
                aria-hidden={false}
              >
                <span
                  className={`block transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    revealed ? "translate-y-0" : "translate-y-[110%]"
                  } ${reducedMotion ? "!translate-y-0 !transition-none" : ""}`}
                  style={{
                    transitionDelay: revealed
                      ? `${120 + index * 140}ms`
                      : "0ms",
                  }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <p
            className={`mt-8 max-w-xl text-[1.05rem] leading-relaxed text-muted transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:mt-10 sm:text-[1.125rem] sm:leading-8 ${
              revealed
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            } ${reducedMotion ? "!translate-y-0 !opacity-100 !transition-none" : ""}`}
            style={{
              transitionDelay: revealed ? "480ms" : "0ms",
            }}
          >
            The Algorithm 26 preserves the people, memories, and milestones of
            the FUPRE graduating class — a shared journey held together so we
            can return to it, long after the ceremonies end.
          </p>
        </div>
      </div>
    </section>
  );
}
