"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type NavItem = { id: string; href: string; label: string; is_external?: number };

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  // Portal target must be resolved client-side after mount (no `document`
  // during SSR); this also naturally gates the portal render until
  // hydration, which is what we want.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll while the drawer is open so the page behind it
  // can't be scrolled, and so touch scrolling on mobile doesn't fight the
  // drawer's own overflow-y-auto.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const drawer = open && (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white text-gray-900 shadow-2xl"
        aria-label="Mobile menu"
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
          <span className="font-semibold text-primary">Menu</span>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-button text-gray-900 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.is_external ? "_blank" : undefined}
              rel={item.is_external ? "noopener noreferrer" : undefined}
              onClick={() => setOpen(false)}
              className="block rounded-button px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/free-class"
            onClick={() => setOpen(false)}
            className="btn-primary mt-3 w-full"
          >
            Free Class
          </Link>
        </nav>
      </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-button text-foreground hover:bg-primary/5"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/*
        Rendered via a portal directly into document.body rather than
        inline here. The header this button lives in uses `backdrop-blur`
        (CSS `backdrop-filter`), and per the CSS spec, `filter` /
        `backdrop-filter` on an ancestor creates a new containing block for
        `position: fixed` descendants — so a fixed-position drawer nested
        inside the header would be constrained to the header's own ~64px
        box instead of the viewport, clipping the nav links out of view
        (only the Menu/X row would appear visible). Portaling to
        document.body sidesteps that entirely.
      */}
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}
