"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function AdminMotion() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-admin-reveal]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-admin-reveal]", start: "top 88%" },
        },
      );

      const pin = document.querySelector<HTMLElement>("[data-admin-pin]");
      const panel = document.querySelector<HTMLElement>("[data-admin-pin-panel]");
      if (pin && panel) {
        ScrollTrigger.create({ trigger: pin, start: "top 18%", end: "bottom 78%", pin: panel, pinSpacing: false });
      }
    }, ref);

    return () => context.revert();
  }, []);

  return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0" />;
}
