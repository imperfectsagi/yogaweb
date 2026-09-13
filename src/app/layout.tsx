import type { Metadata, Viewport } from "next";
import "./globals.css";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/utils";
import { getThemeCssVars } from "@/lib/db";
import { getAllSiteSettings, getFaviconUpdatedAt } from "@/lib/cms";

// generateMetadata (rather than a static `export const metadata`) so the
// favicon can be read from the database on every request — Admin →
// Settings → Site Settings → Favicon takes effect immediately, with no
// rebuild/redeploy, exactly like the theme colors below. Every other
// field here is untouched: buildMetadata() still returns the exact same
// title/description/OpenGraph/Twitter/robots object it always did, and
// every page's own buildMetadata({...}) call (unaffected by this change)
// still overrides title/description per-page as before. Next.js merges a
// page's own metadata over this root layout's, so `icons` set here
// applies site-wide (browser tab, bookmarks, etc.) unless a specific page
// later sets its own `icons` — none currently do.
//
// IMPORTANT — this used to silently NOT work: this project previously
// also had a static src/app/favicon.ico file (the Next.js App Router
// "file convention" favicon). Next.js auto-generates its own
// <link rel="icon"> from that file, and it took precedence over the
// `icons` field below in the actual rendered <head> — so an admin could
// upload a new favicon, see "saved successfully", and the browser tab
// would still show the old one, forever, because the DB-driven value was
// never actually reaching the page. That static file has been removed
// (its image now lives at /public/favicon-default.ico, used as the
// DEFAULT_FAVICON_URL fallback below) so this function is the single,
// unambiguous source of the favicon on every request.
const DEFAULT_FAVICON_URL = "/favicon-default.ico";

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl: string | null = null;
  let faviconUpdatedAt: string | null = null;
  try {
    const settings = await getAllSiteSettings();
    faviconUrl = settings.site_favicon_url || null;
    // Cache-busting query param so a newly-uploaded favicon reliably
    // replaces the old one in the browser tab. Browsers are known to
    // aggressively cache favicons by URL (sometimes for the life of the
    // tab, or longer) — without this, re-uploading a *different* image to
    // the *same* storage URL (or even a new URL, on some browsers/caches)
    // can keep showing the stale icon until a hard refresh. Uses this
    // settings row's own `updated_at` (already tracked in site_settings,
    // no schema change needed) as the cache-bust value.
    if (faviconUrl) faviconUpdatedAt = await getFaviconUpdatedAt();
  } catch {
    faviconUrl = null;
  }

  const resolvedFaviconUrl = faviconUrl
    ? faviconUpdatedAt
      ? `${faviconUrl}${faviconUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(faviconUpdatedAt)}`
      : faviconUrl
    : DEFAULT_FAVICON_URL;

  return {
    ...buildMetadata(),
    metadataBase: new URL(SITE.url),
    // Always set explicitly — either the admin-uploaded favicon or the
    // built-in default — so there's never a fallback to an ambiguous
    // file-convention icon that could get out of sync with what's saved
    // in the database.
    icons: {
      icon: resolvedFaviconUrl,
      shortcut: resolvedFaviconUrl,
      apple: resolvedFaviconUrl,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2d5a4a",
};

// Every request re-renders this layout (see getThemeCssVars below for why),
// so both the public site and the admin panel always reflect the current
// saved theme — including on the very first byte of HTML, with no flash of
// default colors and no separate client-side re-apply step. This must stay
// dynamic; see the comment on getThemeCssVars in src/lib/db.ts.
export const dynamic = "force-dynamic";

// This is the ROOT layout — shared by both the public website (wrapped by
// `(public)/layout.tsx`, which adds Header/Footer/MobileCTA) and the admin
// panel (`/admin`, which has its own separate chrome via AdminShell). It
// intentionally contains no public navigation or footer, so the admin
// panel is never presented as part of the public website and the public
// site never depends on admin UI rendering.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const org = organizationJsonLd();
  const website = websiteJsonLd();
  // Theme colors set in Admin → Appearance → Theme are stored in D1 and
  // injected here as CSS custom properties, overriding the static defaults
  // in globals.css. This runs on every request (no caching) so admin
  // changes are live immediately without a rebuild/redeploy, and so the
  // very first painted frame already has the right theme (no FOUC).
  const themeCss = await getThemeCssVars();

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
