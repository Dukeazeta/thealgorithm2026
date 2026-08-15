"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { transitionStore } from "@/lib/transition";

interface TransitionLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children: React.ReactNode;
  href: string;
}

export function TransitionLink({ children, href, onClick, ...props }: TransitionLinkProps) {
  const router = useRouter();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (onClick) {
      onClick(e);
    }
    
    // Ignore modified clicks (cmd+click, etc)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    const targetUrl = new URL(href.toString(), window.location.href);
    // If it's the exact same URL (including hash), do standard routing
    if (targetUrl.pathname === window.location.pathname && targetUrl.hash === window.location.hash) {
      return;
    }
    
    // If it's a hash link on the same page, scroll instantly, no full transition
    if (targetUrl.pathname === window.location.pathname && targetUrl.hash) {
       return; 
    }

    e.preventDefault();

    transitionStore.animateIn(() => {
      router.push(href.toString());
    });
  };

  return (
    <Link href={href} onClick={handleTransition} {...props}>
      {children}
    </Link>
  );
}
