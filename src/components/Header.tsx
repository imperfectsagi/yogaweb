import Link from "next/link";
import { SITE } from "@/lib/utils";
import { getActiveNavigation, getAllSiteSettings } from "@/lib/cms";
import { MobileNav } from "./MobileNav";

const FALLBACK_NAV = [
  { id: "fallback-home", href: "/", label: "Home" },
  { id: "fallback-about", href: "/about", label: "About" },
  { id: "fallback-services", href: "/services", label: "Services" },
  { id: "fallback-pricing", href: "/pricing", label: "Pricing" },
  { id: "fallback-blog", href: "/blog", label: "Blog" },
  { id: "fallback-contact", href: "/contact", label: "Contact" },
];

type HeaderProps = {
  // When true, the header renders transparent (no background/border) and
  // absolutely positioned so it floats on top of whatever sits behind it,
  // instead of taking up its own row in normal document flow. This is used
  // ONLY by the homepage, where a full-bleed banner image renders behind
  // the header. Every other page calls <Header /> with no props, which
  // renders exactly as before (solid sticky bar, its own row) — this prop
  // is opt-in and changes nothing for existing callers.
  overlay?: boolean;
};

export async function Header({ overlay = false }: HeaderProps = {}) {
  let navItems: { id: string; href: string; label: string; is_external?: number }[] = FALLBACK_NAV;
  try {
    const items = await getActiveNavigation("main");
    if (items.length) {
      navItems = items.map((i) => ({ id: i.id, href: i.url, label: i.label, is_external: i.is_external }));
    }
  } catch {
    navItems = FALLBACK_NAV;
  }

  // Site logo, uploaded from Admin → Settings → Site Settings → Branding.
  // Falls back to the text-only brand name (exactly the old behavior) when
  // no logo has been uploaded.
  let logoUrl: string | null = null;
  try {
    const settings = await getAllSiteSettings();
    logoUrl = settings.site_logo_url || null;
  } catch {
    logoUrl = null;
  }

  const headerClass = overlay
    ? "absolute top-0 left-0 right-0 z-40"
    : "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80";

  const linkClass = overlay ? "text-white/90 hover:text-white transition-colors [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]" : "text-muted hover:text-foreground transition-colors";
  const brandClass = overlay
    ? "font-semibold text-lg text-white tracking-tight [text-shadow:0_1px_3px_rgb(0_0_0_/_0.5)]"
    : "font-semibold text-lg text-primary tracking-tight";

  return (
    <header className={headerClass}>
      <div className="container-narrow flex h-16 items-center justify-between gap-4">
        <Link href="/" className={`flex items-center gap-2 ${brandClass}`}>
          {logoUrl && (
            // Plain <img>, not next/image: this app runs on Cloudflare
            // Workers (@opennextjs/cloudflare), which doesn't support
            // Next's built-in on-the-fly image optimizer, and the logo
            // can be an admin-uploaded file from any of several
            // dimensions — a fixed-size, unoptimized <img> avoids both
            // problems without needing next.config.ts image domain setup.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={SITE.name} className="h-9 w-auto max-w-[160px] object-contain" />
          )}
          <span>{SITE.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.is_external ? "_blank" : undefined}
              rel={item.is_external ? "noopener noreferrer" : undefined}
              className={linkClass}
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
          <MobileNav items={navItems} overlay={overlay} />
        </div>
      </div>
    </header>
  );
}
