# This Round's Changes — FAQ Accordion + Package Reviews

Read this **in addition to** `DEPLOYMENT_GUIDE.md` (base setup),
`CMS_UPDATE_GUIDE.md` and `FIX_SUMMARY.md` (previous rounds). This round
adds one new, additive D1 migration and does not modify any existing
data, bindings, secrets, or deploy flow.

## 1. What was checked first

Before adding anything, the existing project was verified end-to-end:
- Fresh `npm install`, then a full `tsc --noEmit` — zero type errors.
- A full `next build` — compiled successfully, every route generated.
- Manual review of the mobile menu, banner, admin/public layout
  separation, and theme fixes from the previous round — all confirmed
  intact and untouched by this round's changes.

No existing bugs were found in the build itself; this round is purely
the requested features below.

## 2. FAQ accordion

`/faq` and the homepage's FAQ preview section both now use a real
accordion (`src/components/FaqAccordion.tsx`):
- One question open at a time; click a question to expand/collapse it.
- Keyboard accessible (`<button>` elements, `aria-expanded` /
  `aria-controls`), so it works with Tab + Enter/Space, not just a mouse.
- Smooth open/close animation via a CSS grid-rows transition (no layout
  library needed).
- The first question is open by default so the page doesn't look empty
  on load.

No schema or admin changes were needed — FAQs already had a `question`/
`answer`/`sort_order`/`published` model; this only changed how they're
*displayed*.

## 3. Package reviews (new feature)

### What it is
Customers can now leave a star rating + written review + optional photos
on any pricing package, from the public `/pricing` page. Reviews are
moderated: a public submission is **not visible** on the site until an
admin approves it. Admins can also add a review themselves (e.g. one
collected over WhatsApp), which is marked as admin-added and defaults to
already-approved.

### New migration: `migrations/0003_package_reviews.sql`
Adds one new table, `package_reviews`:
- `package_id` — which package the review is for (foreign key to
  `packages`, cascades on delete)
- `customer_name`, `rating` (1–5, enforced by a CHECK constraint),
  `review_text`
- `images_json` — a JSON array of photo URLs (uses the same R2 media
  pipeline as everything else; empty/absent if no photos were attached)
- `status` — `pending` / `approved` / `rejected` (CHECK-constrained;
  only `approved` reviews are ever returned to public pages)
- `is_admin_created` — 1 if added from Admin → Reviews → New, 0 if it
  came through the public form
- `admin_note` — optional, never shown publicly

This migration is purely additive (a new `CREATE TABLE`, nothing altered
or dropped) and was validated against a real SQLite engine: applied
cleanly on top of `0001` + `0002`, the rating/status CHECK constraints
were confirmed to actually reject bad values, and cascade-delete (a
package removed → its reviews removed) was confirmed to work.

Apply it the same way as previous migrations:
```bash
npm run db:migrate:local   # local dev
npm run db:migrate         # production
```

### Public side (`/pricing`)
Each package card now shows:
- An average star rating + review count (only if it has approved reviews)
- A list of approved reviews, each with the reviewer's name, star rating,
  review text, relative time ("3d ago"), and any attached photos
- A "Write a review" link that expands a form (name, star picker, review
  text, up to 4 photos) — submits to `POST /api/reviews`

New public API routes, both rate-limited and unauthenticated (matching
the pattern already used by `/api/leads`):
- `POST /api/reviews` — accepts a review, checks the target package is a
  real/active package, includes a honeypot field for basic bot
  filtering, and always saves as `status = 'pending'`. 5 submissions per
  30 minutes per IP.
- `POST /api/reviews/upload` — a public, images-only upload endpoint
  (JPG/PNG/WebP/AVIF, 3 MB cap) used only by the review photo picker, so
  a visitor can attach a photo without needing an admin login. Stricter
  limits than the admin media upload endpoint on purpose. 10 uploads per
  15 minutes per IP.

Since every public submission starts as `pending`, an uploaded photo can
never appear on the live site unless an admin approves the review it
belongs to — the upload endpoint being public does not bypass moderation.

### Admin side (Admin → Package Reviews)
A new sidebar section, `/admin/reviews`, with:
- A filterable list (All / Pending / Approved / Rejected) showing
  customer, package, star rating, and review text, with a **pending**
  count badge (same pattern as the existing "New Leads" badge)
- One-click **Approve** / **Reject** buttons directly on the list (no
  need to open the full edit form just to moderate)
- **Edit** — opens the full form (package, name, rating, review text,
  photos, status, internal note) for corrections
- **Delete** — same confirm-then-delete pattern as every other admin
  list in this app
- **New Review** — lets an admin add a review directly (e.g. from a
  WhatsApp message or in-person feedback); defaults to Approved and is
  flagged `is_admin_created` so it's distinguishable from a public
  submission if you ever need to audit that
- The main Admin Dashboard now also shows a **Pending Reviews** counter
  card, highlighted whenever it's above zero, same as New Leads

All new admin API routes (`/api/admin/package-reviews`,
`/api/admin/package-reviews/[id]`) go through the same `requireAdmin()`
check as every other admin route, and are automatically covered by the
existing `middleware.ts` edge gate (verified against the middleware's
route matcher — no changes to `middleware.ts` were needed).

### Media library integration
Review photos are stored in the same `media` table and R2 bucket as
every other upload. The existing "warn before delete" check in the
Media Library (`findMediaUsage`) was extended to also detect when an
image is used inside a review's photo list, so deleting a photo an
admin doesn't realize is attached to a review still shows a warning.

## 4. Build/typecheck

Unlike the previous two rounds, this sandbox **did** have working
outbound network access, so verification here is stronger than a static
review:
- `npm install` — succeeded
- `npx tsc --noEmit` — zero errors (run repeatedly through development,
  catching and fixing one real bug: a JSDoc comment containing `*/`
  inside a Tailwind class name comment, which broke the parser)
- `npm run build` (`next build`) — succeeded, all routes compiled and
  generated, including every new page and API route
- A full brace/paren/bracket balance check across all 125 `.ts`/`.tsx`
  files in `src/` — clean
- The new migration executed against a real SQLite engine, including
  constraint and cascade-delete tests (see §3)
- The end-to-end review data flow (submit → approve/reject → grouped
  public query → admin join query) simulated against realistic sample
  data to confirm pending/rejected reviews are correctly excluded from
  public results and admin sorting surfaces pending items first

## 5. Final ZIP filename

`yoga-fit-with-meenu-fixed.zip`
