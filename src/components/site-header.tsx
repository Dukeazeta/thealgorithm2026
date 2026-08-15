"use client";

import { TransitionLink as Link } from "@/components/transition-link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

const navLinks = [
  { href: "/", label: "The Class" },
  { href: "/graduates", label: "Graduates" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#acknowledgements", label: "Acknowledgements" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Staggered entrance animation for menu items
  useEffect(() => {
    if (!open || !panelRef.current) return;
    let cancelled = false;

    async function animate() {
      const { gsap } = await import("gsap");
      if (cancelled || !panelRef.current) return;

      const items = panelRef.current.querySelectorAll("[data-menu-item]");
      const cta = panelRef.current.querySelector("[data-menu-cta]");

      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }
      );

      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.08,
        }
      );

      if (cta) {
        gsap.fromTo(
          cta,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", delay: 0.32 }
        );
      }
    }

    void animate();
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/95 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-[var(--nav-height)] w-full max-w-[96rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-2.5 font-display text-[1.05rem] font-medium tracking-[-0.02em] text-foreground transition-opacity hover:opacity-70"
        >
          <Image
            src="/images/nacos-logo.jpg"
            alt="NACOS"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-105"
          />
          <span>
            The Algorithm <span className="text-muted">26</span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex"
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : link.href.startsWith("/#")
                  ? false
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1.5 text-[0.8125rem] transition-all duration-200 ${
                  isActive
                    ? "bg-black/[0.06] font-semibold text-foreground shadow-xs"
                    : "font-medium text-foreground/70 hover:bg-black/[0.03] hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {pathname !== "/graduates" && !pathname.startsWith("/graduates/") && (
            <Link
              href="/graduates"
              className="hidden h-10 items-center justify-center rounded-lg bg-foreground px-4 text-[0.8125rem] font-medium tracking-[0.01em] text-white transition-colors hover:bg-foreground/85 focus-visible:outline-offset-2 sm:inline-flex"
            >
              Explore the Class
            </Link>
          )}

          {/* Hamburger — morphing two-line style */}
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-black/[0.05] lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="relative block h-4 w-5">
              {/* Top line — slides down and rotates 45deg */}
              <span
                className="absolute left-0 block h-[2px] w-full rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.77,0,0.18,1)]"
                style={{
                  top: open ? "7px" : "2px",
                  transform: open ? "rotate(45deg)" : "rotate(0deg)",
                  width: open ? "100%" : "60%",
                }}
              />
              {/* Bottom line — slides up and rotates -45deg */}
              <span
                className="absolute left-0 block h-[2px] rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.77,0,0.18,1)]"
                style={{
                  top: open ? "7px" : "13px",
                  transform: open ? "rotate(-45deg)" : "rotate(0deg)",
                  width: "100%",
                }}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel — full-width overlay below header */}
      {open && (
        <div
          id={menuId}
          ref={panelRef}
          className="absolute left-0 right-0 top-full z-40 border-t border-black/[0.06] bg-white shadow-lg lg:hidden"
          style={{ opacity: 0 }}
        >
          <nav
            aria-label="Mobile"
            className="mx-auto flex max-w-[96rem] flex-col px-5 pb-6 pt-3 sm:px-6"
          >
            {navLinks.map((link, i) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : link.href.startsWith("/#")
                    ? false
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-menu-item
                  className={`border-b border-black/[0.06] py-3.5 text-[1rem] transition-colors ${
                    i === 0 ? "" : ""
                  } ${
                    isActive
                      ? "font-semibold text-[#123f31]"
                      : "font-medium text-foreground/75 hover:text-foreground"
                  }`}
                  onClick={() => setOpen(false)}
                  style={{ opacity: 0 }}
                >
                  <span className="flex items-center justify-between">
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#123f31]" />
                    )}
                    {!isActive && (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="h-3.5 w-3.5 text-black/25"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 4l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                </Link>
              );
            })}

            {/* CTA at the bottom */}
            {pathname !== "/graduates" && !pathname.startsWith("/graduates/") && (
              <Link
                href="/graduates"
                data-menu-cta
                className="mt-5 flex h-12 items-center justify-center bg-foreground text-[0.8125rem] font-semibold tracking-[0.02em] text-white transition-colors hover:bg-foreground/85"
                onClick={() => setOpen(false)}
                style={{ opacity: 0 }}
              >
                Explore the Class
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Backdrop overlay when menu is open */}
      {open && (
        <div
          className="fixed inset-0 top-[var(--nav-height)] z-30 bg-black/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
