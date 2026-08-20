"use client";

import gsap from "gsap";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { TransitionLink as Link } from "@/components/transition-link";

const destinations = [
  { href: "/", label: "The class" },
  { href: "/graduates", label: "Graduates" },
  { href: "/gallery", label: "Gallery" },
  { href: "/story", label: "Our story" },
] as const;

export function AcknowledgementsView() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from("[data-ack-word]", {
            yPercent: 110,
            rotate: 2,
            duration: 1.35,
            stagger: 0.12,
          })
          .from(
            "[data-ack-intro]",
            { opacity: 0, y: 24, duration: 0.8 },
            "-=0.72",
          )
          .from(
            "[data-ack-link]",
            { opacity: 0, y: 18, duration: 0.7, stagger: 0.07 },
            "-=0.55",
          );

        gsap.fromTo(
          "[data-ack-image]",
          { scale: 1.08, opacity: 0 },
          { scale: 1, opacity: 0.42, duration: 2.2, ease: "power3.out" },
        );

        gsap.to("[data-ack-orbit]", {
          rotate: 360,
          duration: 48,
          ease: "none",
          repeat: -1,
        });
      });

      return () => media.revert();
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="acknowledgements-heading"
      className="relative isolate flex min-h-[calc(100svh-var(--nav-height))] w-full max-w-full items-center overflow-hidden bg-[#123f31] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8"
    >
      <Image
        data-ack-image
        src="/images/hero-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-30 object-cover opacity-[0.42] grayscale contrast-125"
      />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_40%,rgba(18,63,49,.18),rgba(8,24,19,.92)_76%)]" />
      <div
        data-ack-orbit
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[min(76rem,112vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12"
      >
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d7ff5a] shadow-[0_0_2rem_rgba(215,255,90,.8)]" />
      </div>

      <div className="mx-auto flex w-full max-w-[96rem] flex-col items-center text-center">
        <h1
          id="acknowledgements-heading"
          className="max-w-6xl font-display text-[clamp(5rem,16vw,14rem)] leading-[0.72] font-medium tracking-[-0.085em]"
        >
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-ack-word className="block">
              COMING
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-ack-word className="block text-white/48">
              SOON
            </span>
          </span>
        </h1>

        <p
          data-ack-intro
          className="mt-10 max-w-lg text-sm leading-6 text-white/66 sm:mt-12 sm:text-base sm:leading-7"
        >
          A dedicated record of everyone who helped us get here is on its way.
          Until then, keep exploring the class story.
        </p>

        <nav
          aria-label="Explore other pages"
          className="mt-8 grid w-full max-w-md grid-cols-2 gap-2 sm:mt-10 sm:flex sm:w-auto sm:max-w-3xl sm:flex-wrap sm:items-center sm:justify-center sm:gap-3"
        >
          {destinations.map((destination, index) => (
            <Link
              key={destination.href}
              data-ack-link
              href={destination.href}
              className={`inline-flex min-h-12 items-center justify-center rounded-sm px-3 text-[0.7rem] font-semibold tracking-[0.1em] uppercase transition-all duration-300 focus-visible:outline-white sm:px-6 ${
                index === 0
                  ? "bg-white text-[#123f31] hover:bg-[#d7ff5a]"
                  : "border border-white/24 bg-white/[0.04] text-white hover:border-white/48 hover:bg-white/10"
              }`}
            >
              {destination.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
