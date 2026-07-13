"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useId, useState } from "react";

const navLinks = [
  { href: "/graduates", label: "Graduates" },
  { href: "/story", label: "Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/acknowledgements", label: "Acknowledgements" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

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

  return (
    <header className="relative z-50 border-b border-black/[0.04] bg-white">
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
            priority
            className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-105"
          />
          <span>
            The Algorithm <span className="text-muted">26</span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.8125rem] font-medium tracking-[0.01em] text-foreground/75 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/graduates"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-3.5 text-[0.8125rem] font-medium tracking-[0.01em] text-white transition-colors hover:bg-foreground/85 focus-visible:outline-offset-2 sm:px-4"
          >
            Explore the Class
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-foreground transition-colors hover:bg-black/[0.03] lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="relative block h-3.5 w-4">
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-current transition-transform duration-200 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-[1.5px] w-full bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-current transition-transform duration-200 ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id={menuId}
        hidden={!open}
        className="border-t border-black/[0.06] bg-white lg:hidden"
      >
        <nav
          aria-label="Mobile"
          className="mx-auto flex max-w-[96rem] flex-col gap-1 px-4 py-4 sm:px-6"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-3 text-[0.9375rem] font-medium text-foreground/85 transition-colors hover:bg-black/[0.03] hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
