# Read this first — you are replacing an already-live deployment

You (the AI assistant/agent reading this, e.g. Claude Code, running in a
terminal) have been given this project folder to push to GitHub and deploy
to Cloudflare. Before doing anything, understand the situation correctly:

- **This is NOT a fresh install.** A website built from an earlier version
  of this exact codebase is already live in production, at a real domain,
  with real visitors, real leads, real blog posts, real reviews, and real
  uploaded images/videos sitting in a real Cloudflare D1 database and R2
  bucket right now.
- **This folder replaces the old *code*, not the old *data*.** The person
  wants the old GitHub repo's contents replaced with this folder, and the
  live site redeployed from it — but the underlying D1 database, R2
  bucket, KV namespace and custom domain must **stay the same, with all
  existing data intact.** Nothing about their production data should be
  destroyed, recreated, or migrated to a new resource.
- **Do not run `wrangler d1 create`, `wrangler r2 bucket create`, or
  `wrangler kv namespace create`.** Those create brand-new, empty
  resources. The ones this project needs already exist and are already
  wired up — see the next section.

If any step below seems to require creating a new D1/R2/KV resource,
STOP and re-read this file — that almost certainly means you've
misunderstood the task. The correct action is nearly always "reuse what's
already configured," not "provision something new."

---

## 0. What changed in this update (read before deploying)

This drop of the codebase is a **targeted bug-fix pass**, not a redesign.
Five specific issues were fixed; nothing else was intentionally touched.
No new Cloudflare resources, no new D1/R2/KV bindings, and **no new
database migration** are needed for this update — every change below
either edits existing code or reuses the existing `site_settings`
key/value table with new keys, which requires no schema change at all.

1. **Mobile header showed the brand name twice.** Once a logo is
   uploaded (Admin → Site Settings → Branding), the separate text brand
   name next to it is now hidden on mobile only; desktop is unchanged,
   and sites with no logo uploaded still show the text everywhere exactly
   as before.
2. **Package reviews on the Pricing page (desktop):**
   - Cleaned up the rating/"Write a review"/"Read All Reviews" row so it
     no longer crowds or overlaps on desktop widths.
   - Fixed a CSS Grid issue where expanding one package's reviews made
     the *neighboring* package card stretch to match its height even
     though nothing in that neighboring card had changed. Each package
     card now sizes independently (`items-start` on the grid).
   - Review photos now open in a full-size lightbox on click/tap (with a
     close button, backdrop click, and Escape key) instead of only ever
     showing as a small fixed thumbnail.
3. **Homepage testimonials:** photos are now noticeably larger (was an
   almost-invisible 40px circle; now 64px). Only the first 3 testimonials
   show by default, with a "Read All Testimonials" / "Hide Testimonials"
   toggle for the rest — no testimonial data is hidden or deleted, only
   the initial on-screen count.
4. **Favicon uploaded in Admin never showed up on the live site.** Root
   cause: a leftover static `src/app/favicon.ico` file (Next.js's
   "file convention" favicon) was silently overriding the database-driven
   favicon that Admin → Site Settings → Favicon was correctly saving.
   That static file has been removed (the same image now lives at
   `public/favicon-default.ico` as the built-in fallback), and the
   favicon `<head>` metadata is now cache-busted on every save so
   browsers can't keep showing a stale cached icon either.
5. **Homepage hero text readability + new admin color controls:** a
   subtle gradient scrim now sits between the hero banner photo and the
   overlaid text (the photo itself is untouched — nothing was replaced or
   redesigned). Separately, Admin → Site Settings now has a "Homepage
   Text Colors" section with independent HEX color fields for the header
   nav, hero eyebrow, hero heading, hero description, and hero CTA text —
   each optional, each validated as a real HEX code before it can be
   saved, and none of them touch any button background color or any
   other page.

If you're redeploying this folder over the existing live site, proceed
with the normal steps below (1 through 7) — step 5's migration command is
still safe to run (it's a no-op for this update specifically, since no
new migration file was added), and step 6's deploy picks up all five
fixes above automatically.

---

## 1. This project is already wired to the live resources

Open `wrangler.toml` in this folder. It already contains the **real,
live** IDs for this site's existing Cloudflare resources — not
placeholders:

```toml
[[d1_databases]]
binding = "DB"
database_name = "yoga-fit-db"
database_id = "1613bcea-0f1c-4329-bcf0-b9e3c7873a77"   # <- real, already live
migrations_dir = "migrations"

[[r2_buckets]]
binding = "MEDIA"
bucket_name = "yoga-fit-media"                          # <- real, already live

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "b7f9b9dbaddd48f8946edf433cce503f"                 # <- real, already live

[[routes]]
pattern = "yogafitwithmeenu.online"
custom_domain = true
```

**Do not change these values.** They are not `REPLACE_WITH_YOUR_...`
placeholders (that's what a fresh install looks like — this isn't one).
Deploying this code as-is will correctly point at the same database,
bucket, and domain the old code was using. That is the whole point: same
data, same domain, new code.

If — and only if — `wrangler whoami` (see step 3) shows you're logged
into a **different** Cloudflare account than the one that owns these
resources, stop and tell the person; don't try to fix it by creating new
resources under the new account.

---

## 2. Replace the GitHub repo contents

The person will tell you where the existing repo lives (or you may
already have it cloned/connected). The goal: the repo's contents should
become an exact match of this folder, with history handled however the
person prefers (a clean new commit is simplest and safest — don't force
history rewrites unless explicitly asked).

A safe, standard approach:

```bash
# From inside a clone of the existing repo:
# 1. Remove everything currently tracked (but keep .git)
git rm -rf --ignore-unmatch .

# 2. Copy every file from this new project folder into the repo folder
#    (adjust the source path to wherever this folder actually is)
cp -R /path/to/this/project/. .

# 3. Make sure nothing secret or generated gets committed
#    (this project's own .gitignore excludes node_modules, .next,
#    .open-next, .wrangler, .env, .env.local, .env.*.local,
#    tsconfig.tsbuildinfo — do not remove those rules, and double-check
#    with `git status` before committing that no real .env/.env.local
#    file is about to be added)

git add -A
git commit -m "Replace with updated codebase (hero, reviews, site settings, blog/testimonial images, homepage package selection)"
git push
```

If the person says the old repo should be deleted entirely and this
should become a brand-new repo instead, create the new repo first,
push this folder's contents to it, and only delete the old repo after
confirming the new one deployed successfully (step 5) — never delete the
only copy of a working deployment before its replacement is verified
live.

**Never commit `.env`, `.env.local`, or any file containing
`AUTH_SECRET`/`SESSION_SECRET`/API tokens.** Those are set as Cloudflare
Worker secrets (step 4), not committed to git. This project's
`.gitignore` excludes `.env`, `.env.local` and `.env.*.local` — only
`.env.example` (a template with empty/placeholder values, safe to
commit) is tracked. Double-check no real `.env` or `.env.local` file
exists in what you're about to `git add` before committing.

---

## 3. Log in to Cloudflare with the API key

The person will give you a Cloudflare API token. Use it non-interactively
(no browser needed) — this is the standard way to authenticate an
unattended/terminal session:

```bash
export CLOUDFLARE_API_TOKEN=paste_the_token_here
npx wrangler whoami
```

`wrangler whoami` should print the Cloudflare account this token belongs
to. **Confirm this is the same account that already owns the D1/R2/KV
resources in `wrangler.toml`** before continuing — if you're unsure, ask
the person rather than guessing.

Do not print, log, or echo the token value anywhere other than the one
`export` command that sets it.

---

## 4. Install dependencies and check the code

```bash
npm install
npm run typecheck
npm run build
```

Both should pass cleanly. If either fails, stop and fix the actual error
before deploying — do not deploy code that fails typecheck or build. (The
session that produced this code could not run these two commands itself,
for environment reasons, so this is the first time they've actually been
run — read any errors carefully rather than assuming the code is correct.)

If secrets aren't already set on the live Worker from a previous
deployment (ask the person if unsure — if the site is already live, they
almost certainly already are, and re-running this would just overwrite
them with new values, invalidating every existing logged-in admin
session):

```bash
npx wrangler secret put AUTH_SECRET
npx wrangler secret put SESSION_SECRET
```

If the site is already live and working, skip this — don't rotate
secrets as part of a routine redeploy.

---

## 5. Apply the new database migration

This project's migration files (`migrations/0001` through `0004`) are all
written to be safe to (re-)run against a database that already has some
or all of them applied — every `CREATE TABLE` uses `IF NOT EXISTS`, every
seed `INSERT` uses `INSERT OR IGNORE`, and the new `0004` migration only
adds two columns with `ALTER TABLE ADD COLUMN` (which fails loudly with a
"duplicate column" error if it's ever run twice, but cannot corrupt or
delete data either way). So regardless of exactly how earlier migrations
were applied to the live database, running the full set again is safe.

Run:

```bash
npm run db:migrate
```

This uses Wrangler's own migration tracking (`wrangler d1 migrations
apply`), so if the live database already has a tracking record of which
files ran, it will correctly apply **only** the new one,
`0004_homepage_packages.sql`. If for some reason that tracking is
missing or incomplete, Wrangler may attempt to re-run earlier files too —
per the above, that's also safe here, but if you see any unexpected
error rather than the ordinary "already applied" skip messages, stop and
investigate before continuing rather than assuming it's fine.

`0004_homepage_packages.sql` adds two new columns to the existing
`packages` table (`show_on_homepage`, `homepage_sort_order`, both
defaulting to "not shown on homepage"/0). It does not touch, rename, or
rebuild any table, and does not delete or modify any existing row —
every existing package, blog post, review, testimonial, and setting
stays exactly as it is.

Do not run `npm run db:seed` — that inserts default/placeholder content
and is only for a brand-new, empty database. Running it against the live
database would add unwanted duplicate content.

Do not run `create-admin` — the admin account(s) already exist.

---

## 6. Deploy

```bash
npm run deploy
```

This builds the Next.js app for Cloudflare Workers (via
`@opennextjs/cloudflare`) and deploys it to the **same** Worker name
(`yoga-fit-with-meenu`, set in `wrangler.toml`) already serving
`yogafitwithmeenu.online`. Because the custom domain route is already
configured in `wrangler.toml` and already attached to this Worker, the
live domain starts serving the new code as soon as this command finishes
— no DNS or domain reconfiguration needed.

---

## 7. Verify the live site after deploy

Check these in order. If anything looks wrong, it's almost always the
migration (step 5) or a missed secret (step 4) — re-check those before
assuming the code itself is broken.

1. **Homepage loads** at `https://yogafitwithmeenu.online` — hero shows
   "Book a Free Class" and "View Services" only (no "Call" button in the
   hero itself).
2. **Admin login** at `/admin/login` still works with the existing
   admin account — confirms secrets/sessions survived the redeploy.
3. **Pricing page** (`/pricing`) still shows every active package, same
   as before.
4. **Homepage "Classes & Packages" section**: until an admin turns on
   "Show on Homepage" for at least one package (in
   Admin → Pricing → edit a package → Homepage section), this section
   won't show any packages — that's expected with the new opt-in
   behavior, not a bug. Turn it on for a couple of packages to confirm
   it appears correctly.
5. **A package's reviews** on the Pricing page: should show a compact
   rating summary + a "Read All Reviews" button, not a long list by
   default.
6. **Admin → Settings → Site Settings**: confirm the Favicon upload field
   now appears next to the Site Logo field, and that saving reflects on
   the live site (logo in the header, favicon in the browser tab —
   favicon may take a little while to update in an already-open browser
   tab due to normal browser favicon caching, that's expected).
7. **A blog post with a featured image** and **a testimonial with a
   photo**: both should now display their images (previously broken).

If step 2 fails (can't log in), do not re-run `wrangler secret put` as a
first fix — that changes the secrets and invalidates sessions further.
Check the D1 database first: `npx wrangler d1 execute yoga-fit-db --remote --command "SELECT email, role FROM users"`
to confirm the account still exists post-migration.
