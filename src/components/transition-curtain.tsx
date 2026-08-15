"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { transitionStore } from "@/lib/transition";

export function TransitionCurtain() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle Initial Load
  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("app_loaded");
    if (hasLoaded) {
      setIsInitialLoad(false);
      // Immediately hide curtain on mount if not initial load
      if (curtainRef.current) gsap.set(curtainRef.current, { yPercent: -100 });
    } else {
      sessionStorage.setItem("app_loaded", "true");
      // Run heavy initial load animation
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        
        // Counter
        let counter = { val: 0 };
        tl.to(counter, {
          val: 100,
          duration: 2.5,
          ease: "power2.inOut",
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.innerText = Math.round(counter.val).toString();
            }
          }
        });

        // Hide text and lift curtain
        tl.to(textRef.current, { scale: 0.9, opacity: 0, duration: 0.6, ease: "power3.in" }, "+=0.2");
        tl.to(curtainRef.current, { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=0.2");
      });
      return () => ctx.revert();
    }
  }, []);

  // Set up listeners for page transitions
  useEffect(() => {
    if (isInitialLoad) return; 

    const ctx = gsap.context(() => {
      const animateIn = (callback?: () => void) => {
        gsap.to(curtainRef.current, {
          yPercent: 0,
          duration: 1,
          ease: "expo.inOut",
          onComplete: () => {
            if (callback) callback();
          }
        });
      };

      const animateOut = () => {
        gsap.to(curtainRef.current, {
          yPercent: -100,
          duration: 1.2,
          ease: "expo.inOut",
          delay: 0.1 
        });
      };

      transitionStore.setListener((action, callback) => {
        if (action === "in") animateIn(callback);
        if (action === "out") animateOut();
      });
    }, curtainRef);

    return () => {
      ctx.revert();
      transitionStore.removeListener();
    };
  }, [isInitialLoad]);

  // Trigger lift when pathname changes
  useEffect(() => {
    if (!isInitialLoad) {
      transitionStore.animateOut();
    }
  }, [pathname, isInitialLoad]);

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white"
    >
      {isInitialLoad && (
        <div ref={textRef} className="flex flex-col items-center justify-center">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/50 uppercase mb-4">
            The Algorithm 2026
          </p>
          <div className="font-display text-[clamp(4rem,10vw,12rem)] leading-none tracking-tighter">
            <span ref={countRef}>0</span>
            <span className="text-white/30">%</span>
          </div>
        </div>
      )}
    </div>
  );
}
