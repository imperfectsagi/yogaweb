import type { Metadata, Viewport } from "next";
import "./globals.css";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/utils";
import { getThemeCssVars } from "@/lib/db";
import { getAllSiteSettings } from "@/lib/cms";

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
export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl: string | null = null;
  try {
    const settings = await getAllSiteSettings();
    faviconUrl = settings.site_favicon_url || null;
  } catch {
    faviconUrl = null;
  }

  return {
    ...buildMetadata(),
    metadataBase: new URL(SITE.url),
    // Falls back to the default /favicon.ico file-convention icon
    // (src/app/favicon.ico, untouched) when no favicon has been uploaded
    // yet, so a fresh install behaves exactly as before.
    ...(faviconUrl ? { icons: { icon: faviconUrl, shortcut: faviconUrl, apple: faviconUrl } } : {}),
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
