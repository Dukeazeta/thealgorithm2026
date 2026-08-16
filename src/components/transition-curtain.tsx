"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { transitionStore } from "@/lib/transition";

export function TransitionCurtain() {
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement>(null);
  const initialContentRef = useRef<HTMLDivElement>(null);
  const routeContentRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const pendingNavigationRef = useRef<{
    pathname: string;
    timeline: gsap.core.Timeline;
  } | null>(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isBusyRef = useRef(true);

  useEffect(() => {
    const pendingNavigation = pendingNavigationRef.current;

    if (pendingNavigation && pathname !== pendingNavigation.pathname) {
      pendingNavigationRef.current = null;
      pendingNavigation.timeline.resume();
    }
  }, [pathname]);

  // 1. Initial 0 - 100% Loader (Runs on every page reload/mount)
  useEffect(() => {
    isBusyRef.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsInitialLoad(false);
          isBusyRef.current = false;
        },
      });

      const counter = { val: 0 };

      // Animate Counter + Progress Bar
      tl.to(counter, {
        val: 100,
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: () => {
          const current = Math.round(counter.val);
          if (countRef.current) {
            countRef.current.innerText = current < 10 ? `0${current}` : `${current}`;
          }
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${current}%`;
          }
          if (statusRef.current) {
            if (current < 35) {
              statusRef.current.innerText = "INITIALIZING ARCHIVE";
            } else if (current < 75) {
              statusRef.current.innerText = "LOADING CLASS RECORDS";
            } else {
              statusRef.current.innerText = "SYSTEM READY";
            }
          }
        },
      });

      // Fade out initial numbers
      tl.to(
        initialContentRef.current,
        {
          opacity: 0,
          y: -24,
          duration: 0.35,
          ease: "power3.in",
        },
        "+=0.1",
      );

      // Slide curtain up out of view
      tl.to(
        curtainRef.current,
        {
          yPercent: -100,
          duration: 0.85,
          ease: "expo.inOut",
        },
        "-=0.1",
      );
    }, curtainRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // 2. Page Transition Handler
  useEffect(() => {
    const handleTransition = (onCovered: () => void) => {
      if (isBusyRef.current || !curtainRef.current) return;
      isBusyRef.current = true;

      const tl = gsap.timeline({
        onComplete: () => {
          isBusyRef.current = false;
        },
      });

      // Prepare curtain at the top
      gsap.set(curtainRef.current, { yPercent: -100 });
      if (routeContentRef.current) {
        gsap.set(routeContentRef.current, { opacity: 0, y: 10 });
      }

      // Slide curtain down to cover viewport
      tl.to(curtainRef.current, {
        yPercent: 0,
        duration: 0.45,
        ease: "power4.inOut",
      });

      // Fade in subtle route transition indicator
      if (routeContentRef.current) {
        tl.to(
          routeContentRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
            ease: "power2.out",
          },
          "-=0.15",
        );
      }

      // Execute route change when covered
      tl.add(() => {
        pendingNavigationRef.current = {
          pathname: window.location.pathname,
          timeline: tl,
        };
        onCovered();
      });

      // Wait until Next.js has committed the new route before revealing it.
      tl.addPause();

      // Fade out route text
      if (routeContentRef.current) {
        tl.to(routeContentRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.2,
          ease: "power2.in",
        });
      }

      // Slide curtain up to reveal new page
      tl.to(
        curtainRef.current,
        {
          yPercent: -100,
          duration: 0.55,
          ease: "power4.inOut",
        },
        "-=0.1",
      );
    };

    transitionStore.setHandler(handleTransition);

    return () => {
      transitionStore.removeHandler();
    };
  }, []);

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden bg-[#0c0d0d] p-6 text-white sm:p-10 lg:p-14"
      style={{ willChange: "transform" }}
    >
      {/* Top Bar info */}
      <div className="flex items-center justify-between font-mono text-[0.62rem] tracking-[0.2em] text-white/45 uppercase sm:text-[0.68rem]">
        <span>The Algorithm · 2026</span>
        <span>College of Computing</span>
      </div>

      {/* Center 1: Initial 0-100 Loader Content */}
      {isInitialLoad && (
        <div
          ref={initialContentRef}
          className="my-auto flex flex-col items-center justify-center text-center"
        >
          <div className="flex items-baseline font-display text-[clamp(4.5rem,14vw,14rem)] leading-none font-medium tracking-[-0.06em]">
            <span ref={countRef}>00</span>
            <span className="ml-1 text-[clamp(1.75rem,4.5vw,4.5rem)] font-light text-white/35">
              %
            </span>
          </div>

          <p
            ref={statusRef}
            className="mt-6 font-mono text-[0.65rem] tracking-[0.28em] text-white/55 uppercase sm:text-[0.72rem]"
          >
            INITIALIZING ARCHIVE
          </p>
        </div>
      )}

      {/* Center 2: Route Transition Indicator */}
      {!isInitialLoad && (
        <div
          ref={routeContentRef}
          className="my-auto flex flex-col items-center justify-center opacity-0"
        >
          <p className="font-mono text-[0.65rem] tracking-[0.3em] text-white/45 uppercase sm:text-[0.72rem]">
            LOADING
          </p>
          <p className="mt-2 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            The Algorithm 26
          </p>
        </div>
      )}

      {/* Bottom Progress Line (Initial load only) */}
      <div className="w-full">
        {isInitialLoad && (
          <div className="h-[2px] w-full overflow-hidden bg-white/12">
            <div
              ref={progressBarRef}
              className="h-full w-0 bg-white transition-[width] duration-75 ease-linear"
            />
          </div>
        )}
        <div className="mt-4 flex items-center justify-between font-mono text-[0.58rem] tracking-[0.16em] text-white/35 uppercase sm:text-[0.64rem]">
          <span>FUPRE CS</span>
          <span>Class Archive</span>
        </div>
      </div>
    </div>
  );
}
