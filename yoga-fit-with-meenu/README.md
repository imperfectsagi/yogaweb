# Yoga Fit with Meenu

Next.js website + admin panel for **Yoga Fit with Meenu**
**Yoga Classes in Delhi NCR** · https://yogafitwithmeenu.online

Deploys to **Cloudflare Workers** using the official `@opennextjs/cloudflare` adapter, with **D1** (database), **R2** (media storage) and **KV** (rate limiting) bindings.

**Working out of the box:**
- Public marketing site (all pages) with SEO metadata + JSON-LD
- Admin login, protected by server-side sessions + brute-force rate limiting
- Admin password change (with current-password check + strength rules)
- Homepage banner manager — upload an image or video, shown lazily on the homepage
- Public lead API (`/api/leads`) with spam rate-limiting + honeypot field
- D1-backed site settings or banner state

See **DEPLOYMENT_GUIDE.md** for the exact step-by-step Cloudflare setup.

---

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS** (theme via CSS variables)
- **Zod**, **jose**, **bcryptjs** (validation + auth)
- **Cloudflare D1** (SQLite at the edge) — migrations included
- **Cloudflare R2** — media storage (config ready)
- **Cloudflare Workers** deployment target (vinext recommended by Cloudflare, or OpenNext)
- Mobile-first public site, server-rendered pages, minimal client JS

---

## Business details (already in code)

| Field | Value |
|-------|--------|
| Brand | Yoga Fit with Meenu |
| Domain | https://yogafitwithmeenu.online |
| Teacher | Meenu |
| Address | I-55, Gali No. 2, Jaitpur, Badarpur, New Delhi 110044 |
| Phone | +91 7678200212 |
| Email | yoga@yogafitwithmeenu.online |
| Service area | Delhi NCR |

---

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# Edit AUTH_SECRET, SESSION_SECRET (min 32 chars), etc.

# 3. Run
npm run dev
```

Open http://localhost:3000

Public routes work immediately with static/demo content.  
Admin login and D1-backed data require Cloudflare setup (below).

---

## Project structure

```
src/
  app/           # Routes (public + admin)
  components/    # Header, Footer, MobileCTA, etc.
  lib/           # utils, auth, db, seo
  actions/       # Server actions (extend)
  features/      # Domain modules (extend)
migrations/      # D1 SQL migrations
scripts/         # seed.sql
wrangler.toml    # Cloudflare config
```

---

## Cloudflare setup & deployment

Full step-by-step instructions (with exact commands, in order) are in **`DEPLOYMENT_GUIDE.md`** at the root of this project. Short version:

1. `npx wrangler login`
2. Create D1, R2 and KV resources; paste their IDs into `wrangler.toml`
3. Run migrations (`npm run db:migrate`)
4. Create the first admin user (`scripts/generate-admin-sql.js`, see above)
5. Set secrets (`AUTH_SECRET`, `SESSION_SECRET`) with `wrangler secret put`
6. `npm run deploy`

This project deploys via **`@opennextjs/cloudflare`** (Cloudflare's official Next.js → Workers adapter). `wrangler.toml` is already configured for it — no manual adapter setup needed.

---

## Admin authentication

- Server-side session cookies (`src/lib/auth.ts`), signed JWT via `jose`
- Password hashing with `bcryptjs` (12 rounds)
- `requireAdmin()` guards every admin API route
- Roles: `admin` | `editor`
- Login is rate-limited (8/IP + 6/email per 10 minutes) via KV — see `src/lib/rate-limit.ts`
- Password change requires the current password and enforces a minimum strength policy

**Create the first admin user:**

```bash
node scripts/generate-admin-sql.js "admin@yogafitwithmeenu.online" "YourStrongPassword123" "Meenu"
npm run create-admin:local   # local
npm run create-admin         # production (after D1 + migrations are set up)
```

This hashes the password with bcrypt and writes `scripts/create-admin.sql`, which the npm script then runs against D1. Delete `scripts/create-admin.sql` afterwards — treat it as sensitive even though it only contains a hash, not the plaintext password.

Once logged in, go to **Admin → Account & Security** to change the password at any time.

---

## What is included vs what you can extend later

**Included and working**

- All public routes, mobile CTA (Call / WhatsApp / Free Class)
- SEO helpers + JSON-LD (Organization, LocalBusiness, WebSite, FAQ, Breadcrumb), dynamic `sitemap.xml`/`robots.txt`
- D1 schema + seed data
- Admin login with rate limiting, session cookies, password change
- Homepage banner manager (image or video, R2-backed, size/type validated, lazy-loaded on the site)
- Public lead API with spam protection (rate limit + honeypot)
- `.env.example`, `.gitignore`, working `wrangler.toml` for `@opennextjs/cloudflare`

**Structured for you to extend (not required for the site to work)**

- Additional admin CRUD screens (Services, Pricing, Blog, Testimonials, FAQs, Leads list) — the "Dashboard" cards for these are marked "Coming soon"; the D1 tables and typed helpers in `src/lib/db.ts` already exist, so each screen is a form + API route following the same pattern as the Banner manager
- Rich-text blog editor + HTML sanitization
- Cloudflare Turnstile on the contact/lead form (env vars are already wired, just add the widget + server check)
- Automated tests (Playwright / Vitest)

---

## Security checklist

- [x] Admin routes protected server-side (`requireAdmin()`)
- [x] Login + password-change + upload + lead endpoints rate-limited via KV
- [x] All inputs validated with Zod
- [x] Parameterized D1 queries only
- [x] Upload MIME + size validation (5 MB images / 50 MB video, enforced server-side)
- [x] HTTPS only in production, `httpOnly` + `secure` session cookies
- [x] Password strength policy + current-password check on change
- [ ] Set a strong `AUTH_SECRET` / `SESSION_SECRET` via `wrangler secret put` before go-live (see deployment guide)
- [ ] Change the seeded admin password immediately after first login

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Next.js |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run db:migrate:local` | Apply D1 migrations locally |
| `npm run db:migrate` | Apply D1 migrations remotely |
| `npm run db:seed:local` | Seed local D1 |
| `npm run cf:login` | Wrangler login |

---

## License

Private / all rights reserved for the business owner unless otherwise agreed.

---

**Built as a production-oriented starter for Yoga Fit with Meenu.**  
Deploy, connect D1/R2, finish admin CRUD, then go live.
