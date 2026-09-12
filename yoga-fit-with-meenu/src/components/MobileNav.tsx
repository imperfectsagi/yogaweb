"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type NavItem = { id: string; href: string; label: string; is_external?: number };

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

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

      {open && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <aside
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white text-foreground shadow-2xl"
            aria-label="Mobile menu"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <span className="font-semibold text-primary">Menu</span>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-button text-foreground hover:bg-primary/5"
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
                  className="block rounded-button px-4 py-3 text-base font-medium text-foreground hover:bg-primary/5 hover:text-primary"
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
      )}
    </>
  );
}
