import Link from "next/link";
import { SITE } from "@/lib/utils";
import { getActiveNavigation } from "@/lib/cms";
import { MobileNav } from "./MobileNav";

const FALLBACK_NAV = [
  { id: "fallback-home", href: "/", label: "Home" },
  { id: "fallback-about", href: "/about", label: "About" },
  { id: "fallback-services", href: "/services", label: "Services" },
  { id: "fallback-pricing", href: "/pricing", label: "Pricing" },
  { id: "fallback-blog", href: "/blog", label: "Blog" },
  { id: "fallback-contact", href: "/contact", label: "Contact" },
];

export async function Header() {
  let navItems: { id: string; href: string; label: string; is_external?: number }[] = FALLBACK_NAV;
  try {
    const items = await getActiveNavigation("main");
    if (items.length) {
      navItems = items.map((i) => ({ id: i.id, href: i.url, label: i.label, is_external: i.is_external }));
    }
  } catch {
    navItems = FALLBACK_NAV;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-narrow flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-lg text-primary tracking-tight">
          {SITE.name}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.is_external ? "_blank" : undefined}
              rel={item.is_external ? "noopener noreferrer" : undefined}
              className="text-muted hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/free-class" className="btn-primary text-sm py-2 px-4">
            Free Class
          </Link>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <Link href="/free-class" className="btn-primary text-sm py-2 px-3">
            Free Class
          </Link>
          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
