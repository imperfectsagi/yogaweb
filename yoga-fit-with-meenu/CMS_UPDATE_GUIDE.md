# CMS Update Guide — What Changed in This Release

Read this **in addition to** `DEPLOYMENT_GUIDE.md` (your original
account/wrangler/secrets setup guide, unchanged). This document covers
only what's new: the CMS build-out and banner fix, and the one extra
step (§2) needed to apply them.

No bindings, resource names, or secrets were changed. Your existing D1
database (`yoga-fit-db`), R2 bucket (`yoga-fit-media`) and KV namespace
(`RATE_LIMIT`) are reused exactly as configured in `wrangler.toml`.

## 1. Install and build

```bash
npm install
npm run typecheck
npm run build
```

> Note on this delivery: the sandbox this was built in has no
> outbound network access to the npm registry, so these three commands
> could not be executed there. Every file was manually cross-checked
> instead — imports verified to resolve against actual exports, every
> admin form's payload verified field-by-field against its API route's
> Zod schema, Next.js 15 async `params` handling verified across all 40
> page routes and 31 API routes, and CSS classes verified against
> `globals.css`/`tailwind.config.ts` (this caught and fixed a real bug —
> see §5). Both SQL migrations were executed against a real SQLite
> engine, including a simulated run against existing production-shaped
> data, to confirm they apply cleanly and are idempotent (see §2).
>
> Still — **run the three commands above yourself before deploying.**
> The one issue flagged as worth double-checking after `npm install` is
> in §6.

## 2. Apply the new migration

`migrations/0002_cms_enhancements.sql` is additive-only: it uses
`INSERT OR IGNORE` throughout, never modifies `0001_initial.sql`, and
never drops or deletes anything. It was tested against a simulated copy
of your production data (existing custom page content, settings, and
theme rows) and confirmed **not** to overwrite anything already there.

```bash
# Local/dev D1
npx wrangler d1 execute yoga-fit-db --local --file=migrations/0002_cms_enhancements.sql

# Production D1
npx wrangler d1 execute yoga-fit-db --remote --file=migrations/0002_cms_enhancements.sql
```

It seeds:
- Default rows for the About, Contact, Free Class, Privacy Policy and
  Terms pages in the existing `pages` table — only where a row for that
  slug doesn't already exist.
- A few new `site_settings` keys (logo URL, default WhatsApp message,
  social links, business hours, banner focal point/crop) with sensible
  defaults — only where not already set.
- Ensures the `theme_settings` and `seo_settings` singleton rows exist
  (a safe no-op if `scripts/seed.sql` already created them).

Re-running it a second time is safe.

## 3. Deploy

Unchanged from your existing flow:

```bash
npm run build
npx wrangler deploy
```

## 4. What to do after deploying

Log in at `/admin/login` with your existing credentials — nothing about
authentication changed. Then:

- **Media → Homepage Banner** — re-upload your banner if needed; you can
  now click the preview to set the focal point (what stays visible when
  the image is cropped for mobile) and choose cover/contain.
- **Content → Services / Pricing / FAQ / Testimonials / Blog** — these
  were previously hardcoded directly in the page source and are **empty
  in the database**. The public pages now show a "check back soon"
  message until you add real entries here. Nothing was auto-migrated
  from the old hardcoded text, since it wasn't CMS content to begin
  with — please re-enter it (or ask for a follow-up pass to seed it from
  the old hardcoded copy if you'd like a head start).
- **Content → Homepage** — edit hero text and each section's
  heading/description/CTA, or hide sections you don't want shown.
- **Appearance → Theme** — adjust colors with a live preview; changes
  apply site-wide immediately.
- **Appearance → Navigation** — manage header and footer links.
- **Settings → Site Settings / SEO** — logo, social links, business
  hours, and default SEO metadata.

## 5. Root cause of the banner bug (fixed)

The banner upload API already had a working fallback: when
`R2_PUBLIC_URL` isn't reachable, it returns a relative URL
(`/api/media/{key}`) instead of an absolute one. But the endpoint that
*saves* the chosen banner validated the URL with `z.string().url()` —
which rejects relative paths. So the upload itself succeeded (the file
really did land in R2), but saving it as the site banner silently failed
with a generic error, which is why it looked like "upload succeeds but
banner doesn't show." Fixed by accepting both absolute URLs and the
`/api/media/...` fallback path. Focal-point (click-to-set) and
cover/contain crop controls were added at the same time so mobile crops
stay correct.

A second, unrelated bug was also found and fixed during review: the
Privacy Policy, Terms and Blog post pages referenced a `prose` CSS class
for typography that isn't defined anywhere in this project (no
`@tailwindcss/typography` plugin is installed) — it would have rendered
with zero styling. Replaced with explicit spacing/heading utilities.

## 6. One thing to double-check after `npm install`

`src/app/api/admin/pages/[slug]/route.ts` uses `z.record(z.string())` —
the Zod v3 single-argument form, matching your pinned `zod: ^3.24.0`. If
this project is ever upgraded to Zod v4, that call's signature changes.
Not an issue today; just flagging it so a future dependency bump doesn't
silently break the page-content save endpoint.

## 7. Rollback

If anything looks wrong after deploying, roll back the Worker as usual
(`wrangler rollback` or your CI/CD's rollback step). The D1 migration is
additive and doesn't need to be reverted — an older Worker build simply
won't read the new tables/rows.
