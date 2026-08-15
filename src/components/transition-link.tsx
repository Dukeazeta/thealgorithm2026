"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { transitionStore } from "@/lib/transition";

interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps {
  children: React.ReactNode;
  href: string;
}

export function TransitionLink({
  children,
  href,
  onClick,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (onClick) {
      onClick(e);
    }

    // Ignore modified clicks (cmd/ctrl click to open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    try {
      const targetUrl = new URL(href.toString(), window.location.href);

      // External links -> standard navigation
      if (targetUrl.origin !== window.location.origin) {
        return;
      }

      // Hash navigation on the same page -> standard smooth jump, no full screen curtain
      if (targetUrl.pathname === window.location.pathname && targetUrl.hash) {
        return;
      }

      // Same exact page and no hash -> prevent unnecessary reloads
      if (
        targetUrl.pathname === window.location.pathname &&
        targetUrl.search === window.location.search
      ) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      transitionStore.startTransition(() => {
        router.push(href.toString());
      });
    } catch {
      // Fallback in case URL parsing fails
    }
  };

  return (
    <Link href={href} onClick={handleTransition} {...props}>
      {children}
    </Link>
  );
}
