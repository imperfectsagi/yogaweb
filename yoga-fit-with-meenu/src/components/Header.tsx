import Link from "next/link";
import { SITE } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-narrow flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-lg text-primary tracking-tight">
          {SITE.name}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/free-class" className="btn-primary text-sm py-2 px-4">
            Free Class
          </Link>
        </nav>

        {/* Mobile menu toggle would go here – keep simple for starter */}
        <Link href="/free-class" className="md:hidden btn-primary text-sm py-2 px-3">
          Free Class
        </Link>
      </div>
    </header>
  );
}
