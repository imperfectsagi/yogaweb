# Deployment Guide — Yoga Fit with Meenu (Cloudflare)

> **Updated build:** if you're deploying the CMS update (banner fix +
> full admin CMS), also read `CMS_UPDATE_GUIDE.md` — it covers the one
> extra migration step and what's new. This file still covers the base
> account/wrangler/secrets setup and remains accurate.

Follow these steps in order, in GitHub Codespaces (or any terminal with Node.js 20+).
Each command is copy-pasteable. Where you need to paste a value back into a file, it's called out clearly.

---

## 0. Before you start

You'll need:
- A Cloudflare account with your API Token (you said you already have this)
- The project zip, unzipped in your Codespace

```bash
unzip yoga-fit-with-meenu.zip
cd yoga-fit-with-meenu
npm install
```

---

## 1. Log in to Cloudflare

```bash
npx wrangler login
```

This opens a browser tab to authorize. If you're using an API Token instead of interactive login (common in Codespaces), set it as an environment variable instead and skip the browser step:

```bash
export CLOUDFLARE_API_TOKEN=your_token_here
```

Verify you're logged in:

```bash
npx wrangler whoami
```

---

## 2. Create the D1 database

```bash
npx wrangler d1 create yoga-fit-db
```

This prints something like:

```
[[d1_databases]]
binding = "DB"
database_name = "yoga-fit-db"
database_id = "1a2b3c4d-....."
```

**Copy the `database_id` value.** Open `wrangler.toml` and replace:

```toml
database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"
```

with your real ID.

---

## 3. Create the R2 bucket (for banner images/videos and other media)

```bash
npx wrangler r2 bucket create yoga-fit-media
```

`wrangler.toml` already has the `[[r2_buckets]]` block pointing at `yoga-fit-media` — no ID to paste here, R2 buckets are referenced by name.

### 3a. (Recommended) Give the bucket a public URL

For the fastest image/video loading, connect a custom domain to the bucket:

1. Cloudflare dashboard → **R2** → `yoga-fit-media` → **Settings** → **Custom Domains** → **Connect Domain**
2. Use a subdomain you control, e.g. `media.yogafitwithmeenu.online`
3. Once connected, open `wrangler.toml` and confirm this line matches your domain:
   ```toml
   R2_PUBLIC_URL = "https://media.yogafitwithmeenu.online"
   ```

If you skip this step, uploaded media still works — it's served through a fallback API route — but a direct R2 custom domain is faster because Cloudflare serves it straight from cache at the edge.

---

## 4. Create the KV namespace (used for rate limiting / brute-force protection)

```bash
npx wrangler kv namespace create RATE_LIMIT
```

This prints something like:

```
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "9f8e7d6c....."
```

**Copy the `id` value.** Open `wrangler.toml` and replace:

```toml
id = "REPLACE_WITH_YOUR_KV_NAMESPACE_ID"
```

with your real ID.

---

## 5. Run the database migration

This creates all the tables (users, services, blog posts, media, leads, site settings, etc.):

```bash
npm run db:migrate
```

(Use `npm run db:migrate:local` first if you want to test locally with `wrangler dev` before touching production — optional.)

---

## 6. Seed default content (optional but recommended)

Adds sensible defaults for homepage sections, SEO settings and theme:

```bash
npm run db:seed
```

---

## 7. Create your admin account

This generates a SQL file with your password securely hashed, then runs it against the database.

```bash
node scripts/generate-admin-sql.js "your-email@example.com" "YourStrongPassword123" "Your Name"
npm run create-admin
```

Requirements for the password: at least 10 characters. Mixing uppercase, lowercase and numbers is strongly recommended (the admin panel will also enforce this if you change it later).

**Important:** after running this, delete the generated file so the hash doesn't sit in your repo:

```bash
rm scripts/create-admin.sql
```

You can create more admin/editor accounts later the same way — just run the two commands again with different details.

---

## 8. Set your session secrets

These sign the admin login session cookies. Generate two long random strings and set them as Worker secrets (never put these directly in `wrangler.toml` or commit them to git):

```bash
npx wrangler secret put AUTH_SECRET
# paste a random 32+ character string when prompted

npx wrangler secret put SESSION_SECRET
# paste a different random 32+ character string when prompted
```

To generate a strong random string, you can run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice (once for each secret) and paste each output when `wrangler secret put` prompts you.

---

## 9. Deploy

```bash
npm run deploy
```

This builds the Next.js app, adapts it for Cloudflare Workers via `@opennextjs/cloudflare`, and deploys it. At the end, Wrangler prints your live `*.workers.dev` URL.

---

## 10. Connect your custom domain

In the Cloudflare dashboard:

1. **Workers & Pages** → your worker (`yoga-fit-with-meenu`) → **Settings** → **Domains & Routes** → **Add** → **Custom Domain**
2. Enter `yogafitwithmeenu.online` (and `www.yogafitwithmeenu.online` if you want both)
3. Cloudflare handles the DNS + SSL automatically if the domain's nameservers are already pointed at Cloudflare

---

## 11. Log in and change your password

1. Visit `https://yogafitwithmeenu.online/admin/login`
2. Sign in with the email/password you created in Step 7
3. Go to **Account & Security** in the admin menu and set a fresh password — this confirms the whole login → session → password-change flow works end-to-end, and means the password you typed into a terminal during setup isn't the one that stays live long-term

---

## 12. Upload your homepage banner

1. In the admin panel, go to **Homepage Banner**
2. Upload an image (JPG/PNG/WebP/AVIF, up to 5 MB) or a short video (MP4/WebM, up to 50 MB)
3. Add a short description (used for SEO and screen readers)

It appears on the homepage immediately — no redeploy needed, since it's stored in the database and R2, not in the code.

---

## Ongoing: making updates after this

Whenever you change code and want to redeploy:

```bash
npm run deploy
```

Whenever you change the database schema, add a new migration file in `migrations/` (following the same pattern as `0001_initial.sql`) and run:

```bash
npm run db:migrate
```

---

## Troubleshooting

**`wrangler deploy` fails with "binding not found"**
Double-check `wrangler.toml` — the `database_id` (Step 2) and KV `id` (Step 4) must be your real values, not the `REPLACE_WITH_...` placeholders.

**Login page says "Invalid email or password" even though it's correct**
Make sure Step 7 actually completed — run `npx wrangler d1 execute yoga-fit-db --remote --command "SELECT email, role FROM users"` to confirm the account exists.

**Banner upload fails with "Not authorized"**
Your session may have expired (sessions last 7 days) — log in again.

**Images/video load slowly**
Confirm Step 3a (R2 custom domain) is done — without it, media is served through a Worker route instead of directly from Cloudflare's cache, which is slower.

**"AUTH_SECRET / SESSION_SECRET must be set" error after deploy**
Step 8 wasn't completed, or the secret is under 32 characters. Re-run `wrangler secret put AUTH_SECRET` with a longer value.
