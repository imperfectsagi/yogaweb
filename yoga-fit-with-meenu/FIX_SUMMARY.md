# Fix Summary — Banner, Mobile Menu, Admin Separation, Theme FOUC

Read this **in addition to** `DEPLOYMENT_GUIDE.md` (base setup) and
`CMS_UPDATE_GUIDE.md` (the CMS build-out from the previous round). This
document covers only this round's fixes: no new D1 migration is needed —
everything here is UI/architecture/logic, not schema.

No bindings, resource names, secrets, or the API-token-based deploy flow
were touched. `wrangler.toml`, `package.json`, `next.config.ts`,
`open-next.config.ts`, `tsconfig.json` and `.env.example` are all
byte-identical to what you uploaded. `R2_PUBLIC_URL` is still `""` — the
banner fix does not require an R2 custom domain.

## 1. What was wrong

1. **Hero banner** — `HomeBanner.tsx` forced every uploaded image into a
   fixed-height box (`h-56 sm:h-72 md:h-96`) with `object-fit: cover` as
   the default, which crops the image to fill that box regardless of its
   real aspect ratio. Wide or tall images lost significant content.
2. **Mobile hamburger menu** — clicking the hamburger opened the drawer,
   but only the Menu/X header bar was visible; the nav links were
   present in the DOM but not visibly rendered.
3. **Admin/public separation** — the root layout wrapped every route,
   including all of `/admin`, in the public Header/Footer/mobile CTA
   bar, so the admin panel was visually tangled up with the public site
   chrome.
4. **Admin ON/OFF controls** — the Homepage section visibility switch
   was hidden inside a collapsed accordion row, so it read as missing
   even though it existed and worked once you clicked in.
5. **Theme flash on refresh** — changing the theme in admin and then
   hard-refreshing the public site would briefly (or persistently, until
   cache expiry) show the old/default theme instead of the saved one.
6. **Hero layout spacing** — the banner sat below an oversized gap and
   was constrained to the hero's narrow text column width instead of the
   full container width.

## 2. What was changed, and why

### Mobile menu (root cause: a CSS spec detail, not a data problem)

`Header.tsx`'s `<header>` uses `backdrop-blur` (CSS `backdrop-filter`).
Per the CSS spec, `filter`/`backdrop-filter` on an element creates a new
**containing block** for any `position: fixed` descendant — so
`MobileNav`'s drawer (`fixed inset-0`), rendered as a child of that
header, was being constrained to the header's own ~64px-tall box instead
of the full viewport. That's why only the Menu/X row was visible: the
rest of the drawer was rendered *outside the visible clipped area*, not
actually missing.

**Fix:** `MobileNav.tsx` now renders its open drawer through
`createPortal(..., document.body)`, which places it directly under
`<body>` — completely outside the header's containing block, so
`fixed inset-0` correctly spans the real viewport. A body-scroll lock was
also added while the drawer is open.

A second, independent bug was fixed at the same time: the drawer used a
hardcoded `bg-white` panel combined with the theme-driven `text-foreground`
class. Since `--color-foreground` is fully admin-configurable via
Appearance → Theme, an admin choosing a light foreground color could make
the drawer's text invisible against its own background. The drawer now
uses fixed, guaranteed-contrast colors (`bg-white` / `text-gray-900` /
`border-gray-200`) instead of mixing a fixed background with a dynamic
text color.

We also confirmed via `scripts/seed.sql` that the navigation table's
`"main"` location (not the also-supported-but-unused `"mobile"` location)
is the correct, single source for both desktop and mobile nav — the
schema supports a separate `"mobile"` location for future use, but no
navigation rows use it today, so `Header.tsx` correctly reuses the same
`"main"` data for both.

### Hero banner (root cause: fixed-height box + cover-by-default)

`HomeBanner.tsx` now defaults to `object-fit: contain` and sizes its
frame from the image's own intrinsic aspect ratio (`height: auto` +
`max-height`) instead of a fixed pixel height — so the complete image is
shown, letterboxed if needed, rather than cropped. This default was
updated in **four places** so it applies consistently:
- `HomeBanner.tsx` (the public rendering)
- `BannerManager.tsx` (both the initial default and what a brand-new
  upload gets set to)
- `POST /api/admin/banner` (server-side fallback if `fit` isn't sent)
- `getBannerSettings()` in `src/lib/db.ts` — **this is the important
  one for your already-live banner**: it's the fallback used when no
  `banner_fit` value has ever been saved to D1, which is the case for
  a banner uploaded before this fix existed. Updating this default means
  your current live banner switches to showing the full image
  immediately on deploy, with no need to re-upload or re-save anything.

Admins can still choose "Fill area (crops edges)" from the Homepage
Banner screen if they specifically want an edge-to-edge crop for a wide
landscape image — that option (`cover`) still works exactly as before,
it's just no longer the default. Video banners and the R2/`unoptimized`
image delivery path are unchanged.

### Admin/public separation (root cause: single shared root layout)

Next.js's App Router renders a route's full layout chain, and since
`/admin` had no separate layout group, it inherited the root layout's
`<Header /><Footer /><MobileCTA />` along with every other route.

**Fix:** all public routes (home, about, services, pricing, blog,
contact, free-class, FAQ, privacy policy, terms) were moved into a
`(public)` route group — `src/app/(public)/`. Route groups in Next.js
are purely organizational (the parentheses are stripped from the URL),
so `/about` still resolves to `/about`, not `/public/about`. A new
`src/app/(public)/layout.tsx` now owns `Header`/`Footer`/`MobileCTA`,
and the root `src/app/layout.tsx` was slimmed down to only the shared
`<html>/<head>` infrastructure (theme `<style>` injection, JSON-LD) that
both the public site and `/admin` need. `/admin` no longer renders any
public navigation.

We also added `src/middleware.ts` as an edge-level gate: any request to
an `/admin/*` page (except `/admin/login` itself) with no session cookie
at all is redirected to the login page before any admin page code even
runs. This is a lightweight cookie-presence check, intentionally — the
existing, proven `requireAdmin()`/`getSession()` checks in every admin
page and every `/api/admin/*` route (using `jose` JWT verification
against your `AUTH_SECRET`/`SESSION_SECRET`) remain the actual source of
truth for whether a session is valid, unchanged. The middleware adds a
fast first line of defense without touching or re-implementing that
verification logic. Verified against all 27 real `/admin/*` routes to
confirm correct coverage, including the bare `/admin` dashboard route
and the `/admin/login` exclusion.

### Admin ON/OFF controls (root cause: control hidden behind a click)

`Admin → Homepage`'s section visibility toggle only appeared after
clicking to expand that section's row — easy to miss, and easy to read
as "the control doesn't exist." The switch is now shown directly on the
collapsed row for every section, with an explicit **ON**/**OFF** text
label next to it (not just color), saves instantly when clicked (no need
to also open the row and press a separate "Save" button just to change
visibility), and rolls back visually if the save request fails. Editing
a section's heading/description/CTA still uses the expand-and-save flow,
since those are multi-field edits that make sense to batch together.

### Theme flash / stale theme on refresh (root cause: cacheable layout)

The root layout already read the saved theme from D1 and injected it as
CSS variables in `<head>` before first paint — so in principle there was
never a *client-side* flash. But the layout had no explicit dynamic
rendering directive, which meant Next.js/Cloudflare's edge caching could
serve a previously-rendered HTML response (theme `<style>` block
included) instead of re-reading D1 on every request — which looks
exactly like "the old theme comes back after a refresh," because it's a
stale cached response, not a live re-render.

**Fix:** added `export const dynamic = "force-dynamic";` to the root
layout, so it's never statically cached — every request reads the
current theme from D1 and paints it as the very first frame. No
client-side localStorage/cookie theme layer was needed or added; the
existing D1 → SSR `<style>` approach is correct once caching is
disabled for this layout.

### Hero layout

The banner previously sat inside the hero's narrow `max-w-3xl` text
column with a `mt-10` gap after the CTAs. It now sits at the hero's full
`container-narrow` width (wider, more usable space for the image) with a
consistent `mt-6` spacing, while remaining inside the same `<section>`
as the eyebrow/H1/description/CTAs — one continuous hero block, not a
separate section below it.

## 3. Build/typecheck

This sandbox has no outbound access to the npm registry (`npm install`
fails with a 403), so `npm ci`, `npm run typecheck` and `npm run build`
could not be executed here — same limitation as the previous round.
Verification performed instead:
- Brace/paren balance check across every `.ts`/`.tsx` file (all clean)
- Every `@/lib/*` and `@/components/*` import cross-checked against
  actual exports, including all files touched or moved this round (all
  resolve correctly)
- A full project `tsc --noEmit` pass, with the expected "module not
  found" noise (from the absent `node_modules`) filtered out, to catch
  any genuine new type errors — none found in this round's changed
  files
- The middleware's route matcher was tested against all 27 real
  `/admin/*` page routes (including the bare `/admin` dashboard and the
  `/admin/login` exclusion) using plain Node regex tests to confirm
  correct coverage
- Both SQL migrations re-validated by executing them against a real
  SQLite engine (unchanged from the previous round — no new migration
  was needed for this round's fixes)
- Confirmed byte-for-byte that `wrangler.toml`, `package.json`,
  `next.config.ts`, `open-next.config.ts`, `tsconfig.json` and
  `.env.example` are identical to your upload

**Please run `npm ci && npm run typecheck && npm run build` yourself
before deploying**, as requested.

## 4. Test sequence for the theme fix

To verify #5 after deploying:
1. Open the public website.
2. In `/admin/theme`, select different colors and save.
3. Open the public website in a fresh tab (or hard refresh).
4. The new colors should already be visible on the very first paint —
   no flash of the old colors first.
5. Navigate to another page, then back to the homepage — theme stays.
6. Refresh again — theme still holds.

## 5. Final ZIP filename

`yoga-fit-with-meenu-fixed.zip`
