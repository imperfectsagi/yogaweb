/**
 * Database + bindings access layer for Cloudflare (D1, R2, KV).
 *
 * On Cloudflare Workers (via @opennextjs/cloudflare) all bindings declared
 * in wrangler.toml are reached through getCloudflareContext(). This works
 * both in production and in `next dev` (after initOpenNextCloudflareForDev()
 * runs in next.config.ts), so the same code path is used everywhere.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database, R2Bucket, KVNamespace } from "@cloudflare/workers-types";

export type CloudflareEnv = {
  DB: D1Database;
  MEDIA: R2Bucket;
  RATE_LIMIT: KVNamespace;
  AUTH_SECRET?: string;
  SESSION_SECRET?: string;
  R2_PUBLIC_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

export function getDb(): D1Database {
  const { env } = getCloudflareContext() as unknown as { env: CloudflareEnv };
  if (!env?.DB) {
    throw new Error(
      "D1 binding 'DB' not found. Make sure wrangler.toml has a [[d1_databases]] entry with binding = \"DB\" and that you're running under `wrangler dev` / a deployed Worker."
    );
  }
  return env.DB;
}

export function getMediaBucket(): R2Bucket {
  const { env } = getCloudflareContext() as unknown as { env: CloudflareEnv };
  if (!env?.MEDIA) {
    throw new Error(
      "R2 binding 'MEDIA' not found. Make sure wrangler.toml has a [[r2_buckets]] entry with binding = \"MEDIA\"."
    );
  }
  return env.MEDIA;
}

export function getRateLimitKv(): KVNamespace {
  const { env } = getCloudflareContext() as unknown as { env: CloudflareEnv };
  if (!env?.RATE_LIMIT) {
    throw new Error(
      "KV binding 'RATE_LIMIT' not found. Make sure wrangler.toml has a [[kv_namespaces]] entry with binding = \"RATE_LIMIT\"."
    );
  }
  return env.RATE_LIMIT;
}

export function getEnv(): CloudflareEnv {
  const { env } = getCloudflareContext() as unknown as { env: CloudflareEnv };
  return env;
}

// ---------------------------------------------------------------------------
// Typed query helpers
// ---------------------------------------------------------------------------

export async function getPublishedServices() {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT id, name, slug, short_description, featured_image, price_starting_from, online_available, offline_available, sort_order
       FROM services WHERE published = 1 ORDER BY sort_order ASC`
    )
    .all();
  return results || [];
}

export async function getServiceBySlug(slug: string) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM services WHERE slug = ? AND published = 1`)
    .bind(slug)
    .first();
}

export async function getActivePackages() {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT * FROM packages WHERE is_active = 1 ORDER BY sort_order ASC`
    )
    .all();
  return results || [];
}

// ---------------------------------------------------------------------------
// Package reviews (public-facing: approved only)
// ---------------------------------------------------------------------------

export type PublicPackageReview = {
  id: string;
  package_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  images_json: string | null;
  created_at: string;
};

/** Approved reviews for a single package, newest first. */
export async function getApprovedReviewsForPackage(packageId: string): Promise<PublicPackageReview[]> {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT id, package_id, customer_name, rating, review_text, images_json, created_at
       FROM package_reviews WHERE package_id = ? AND status = 'approved'
       ORDER BY created_at DESC`
    )
    .bind(packageId)
    .all<PublicPackageReview>();
  return results || [];
}

/** Approved reviews for every package in one query, grouped by package_id.
 * Used on the pricing page so it doesn't need one query per package. */
export async function getApprovedReviewsByPackage(): Promise<Record<string, PublicPackageReview[]>> {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT id, package_id, customer_name, rating, review_text, images_json, created_at
       FROM package_reviews WHERE status = 'approved'
       ORDER BY created_at DESC`
    )
    .all<PublicPackageReview>();
  const grouped: Record<string, PublicPackageReview[]> = {};
  for (const r of results || []) {
    (grouped[r.package_id] ||= []).push(r);
  }
  return grouped;
}

export async function createPackageReview(data: {
  package_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  images_json?: string | null;
}): Promise<string> {
  const db = getDb();
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO package_reviews (id, package_id, customer_name, rating, review_text, images_json, status, is_admin_created)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 0)`
    )
    .bind(
      id,
      data.package_id,
      data.customer_name,
      data.rating,
      data.review_text,
      data.images_json || null
    )
    .run();
  return id;
}

export async function getPublishedPosts(limit = 10) {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT id, title, slug, excerpt, featured_image, published_at, reading_time
       FROM blog_posts WHERE published = 1 ORDER BY published_at DESC LIMIT ?`
    )
    .bind(limit)
    .all();
  return results || [];
}

export async function getPostBySlug(slug: string) {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM blog_posts WHERE slug = ? AND published = 1`)
    .bind(slug)
    .first();
}

export async function getHomepageSections() {
  const db = getDb();
  // Intentionally selects ALL sections (not just enabled ones) so the
  // homepage can tell "disabled" apart from "not found" -- filtering to
  // enabled=1 here would make a disabled section indistinguishable from a
  // missing row, and the homepage's per-section visibility check needs to
  // see the real enabled flag to hide it correctly.
  const { results } = await db
    .prepare(`SELECT * FROM homepage_sections ORDER BY sort_order ASC`)
    .all();
  return results || [];
}

export async function getTheme() {
  const db = getDb();
  return db.prepare(`SELECT * FROM theme_settings WHERE id = 1`).first<{
    id: number;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    foreground_color: string;
    muted_color: string;
    border_color: string;
    button_radius: string;
    card_radius: string;
    updated_at: string;
  }>();
}

/** Converts "#RRGGBB" to "R G B" (space-separated channel triplet) so it can
 * be dropped straight into the CSS custom properties globals.css expects
 * (Tailwind's rgb(var(--x) / <alpha-value>) pattern needs bare channels,
 * not a "#" hex string). Falls back to black on malformed input rather than
 * throwing, since this runs during SSR of every page. */
function hexToRgbTriplet(hex: string): string {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return "0 0 0";
  const int = parseInt(match[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${r} ${g} ${b}`;
}

/** Builds the inline <style> CSS custom properties block for the current
 * theme, falling back to the built-in defaults (matching globals.css) if
 * no row exists yet or D1 isn't reachable. Used in the root layout so a
 * theme change in the admin applies site-wide without a rebuild. */
export async function getThemeCssVars(): Promise<string> {
  const DEFAULTS = {
    primary_color: "#2D5A4A",
    secondary_color: "#8B7355",
    accent_color: "#C4A484",
    background_color: "#FAF8F5",
    foreground_color: "#1A1A1A",
    muted_color: "#6B7280",
    border_color: "#E5E0D8",
    button_radius: "0.5rem",
    card_radius: "0.75rem",
  };

  let theme: typeof DEFAULTS = DEFAULTS;
  try {
    const row = await getTheme();
    if (row) {
      theme = {
        primary_color: row.primary_color || DEFAULTS.primary_color,
        secondary_color: row.secondary_color || DEFAULTS.secondary_color,
        accent_color: row.accent_color || DEFAULTS.accent_color,
        background_color: row.background_color || DEFAULTS.background_color,
        foreground_color: row.foreground_color || DEFAULTS.foreground_color,
        muted_color: row.muted_color || DEFAULTS.muted_color,
        border_color: row.border_color || DEFAULTS.border_color,
        button_radius: row.button_radius || DEFAULTS.button_radius,
        card_radius: row.card_radius || DEFAULTS.card_radius,
      };
    }
  } catch {
    // D1 unreachable (e.g. plain `next dev`) — fall back to defaults.
  }

  return `:root{--color-primary:${hexToRgbTriplet(theme.primary_color)};--color-secondary:${hexToRgbTriplet(
    theme.secondary_color
  )};--color-accent:${hexToRgbTriplet(theme.accent_color)};--color-background:${hexToRgbTriplet(
    theme.background_color
  )};--color-foreground:${hexToRgbTriplet(theme.foreground_color)};--color-muted:${hexToRgbTriplet(
    theme.muted_color
  )};--color-border:${hexToRgbTriplet(theme.border_color)};--radius-button:${theme.button_radius};--radius-card:${
    theme.card_radius
  };}`;
}

export async function getFaqs(homepageOnly = false) {
  const db = getDb();
  const query = homepageOnly
    ? `SELECT * FROM faqs WHERE published = 1 AND show_on_homepage = 1 ORDER BY sort_order ASC`
    : `SELECT * FROM faqs WHERE published = 1 ORDER BY sort_order ASC`;
  const { results } = await db.prepare(query).all();
  return results || [];
}

export async function getSiteSetting(key: string): Promise<string | null> {
  const db = getDb();
  const row = await db
    .prepare(`SELECT value FROM site_settings WHERE key = ?`)
    .bind(key)
    .first<{ value: string }>();
  return row?.value ?? null;
}

export async function setSiteSetting(key: string, value: string) {
  const db = getDb();
  await db
    .prepare(
      `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    )
    .bind(key, value)
    .run();
}

// Homepage banner (hero) is stored as a small set of site_settings keys so it
// can hold either an image or a video without a schema migration.
export type BannerSettings = {
  type: "image" | "video" | null;
  mediaId: string | null;
  url: string | null;
  posterUrl: string | null; // poster/thumbnail for video banners
  altText: string | null;
  focalX: number; // 0-100, horizontal focal point for object-position
  focalY: number; // 0-100, vertical focal point for object-position
  fit: "cover" | "contain";
};

export async function getBannerSettings(): Promise<BannerSettings> {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT key, value FROM site_settings WHERE key IN
       ('banner_type','banner_media_id','banner_url','banner_poster_url','banner_alt_text','banner_focal_x','banner_focal_y','banner_fit')`
    )
    .all<{ key: string; value: string }>();
  const map = Object.fromEntries((results || []).map((r) => [r.key, r.value]));
  return {
    type: (map.banner_type as "image" | "video") || null,
    mediaId: map.banner_media_id || null,
    url: map.banner_url || null,
    posterUrl: map.banner_poster_url || null,
    altText: map.banner_alt_text || null,
    focalX: map.banner_focal_x ? Number(map.banner_focal_x) : 50,
    focalY: map.banner_focal_y ? Number(map.banner_focal_y) : 50,
    // Defaults to "cover" (fill the full-width hero edge-to-edge, no gray
    // gaps) for any banner saved before this field existed in D1, matching
    // the homepage's default rendering. Admins can switch an individual
    // banner to "contain" from Admin → Homepage Banner if they'd rather
    // show the complete image with letterboxing instead.
    fit: (map.banner_fit as "cover" | "contain") || "cover",
  };
}

export async function setBannerSettings(banner: BannerSettings) {
  const db = getDb();
  const entries: [string, string][] = [
    ["banner_type", banner.type || ""],
    ["banner_media_id", banner.mediaId || ""],
    ["banner_url", banner.url || ""],
    ["banner_poster_url", banner.posterUrl || ""],
    ["banner_alt_text", banner.altText || ""],
    ["banner_focal_x", String(banner.focalX ?? 50)],
    ["banner_focal_y", String(banner.focalY ?? 50)],
    ["banner_fit", banner.fit || "cover"],
  ];
  const stmts = entries.map(([key, value]) =>
    db
      .prepare(
        `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
      )
      .bind(key, value)
  );
  await db.batch(stmts);
}

export async function createLead(data: {
  name: string;
  phone?: string;
  email?: string;
  interested_service?: string;
  preferred_mode?: string;
  preferred_time?: string;
  message?: string;
  source?: string;
}) {
  const db = getDb();
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO leads (id, name, phone, email, interested_service, preferred_mode, preferred_time, message, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      data.name,
      data.phone || null,
      data.email || null,
      data.interested_service || null,
      data.preferred_mode || null,
      data.preferred_time || null,
      data.message || null,
      data.source || "website"
    )
    .run();
  return id;
}

// ---------------------------------------------------------------------------
// Users (admin auth)
// ---------------------------------------------------------------------------

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "admin" | "editor";
  is_active: number;
};

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM users WHERE email = ? AND is_active = 1`)
    .bind(email.toLowerCase().trim())
    .first<UserRow>();
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM users WHERE id = ? AND is_active = 1`)
    .bind(id)
    .first<UserRow>();
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  const db = getDb();
  await db
    .prepare(
      `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`
    )
    .bind(passwordHash, userId)
    .run();
}

// ---------------------------------------------------------------------------
// Media (R2-backed)
// ---------------------------------------------------------------------------

export async function insertMediaRecord(data: {
  id: string;
  filename: string;
  originalFilename: string;
  r2Key: string;
  url: string;
  mimeType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
}) {
  const db = getDb();
  await db
    .prepare(
      `INSERT INTO media (id, filename, original_filename, r2_key, url, mime_type, width, height, file_size, alt_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      data.id,
      data.filename,
      data.originalFilename,
      data.r2Key,
      data.url,
      data.mimeType,
      data.width ?? null,
      data.height ?? null,
      data.fileSize,
      data.altText ?? null
    )
    .run();
}

export async function listMedia(limit = 50) {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM media ORDER BY created_at DESC LIMIT ?`)
    .bind(limit)
    .all();
  return results || [];
}

export async function deleteMediaRecord(id: string) {
  const db = getDb();
  const row = await db
    .prepare(`SELECT r2_key FROM media WHERE id = ?`)
    .bind(id)
    .first<{ r2_key: string }>();
  await db.prepare(`DELETE FROM media WHERE id = ?`).bind(id).run();
  return row?.r2_key || null;
}

/** Finds every place a media URL is currently referenced, so the admin can
 * be warned before deleting an asset that's still in use. */
export async function findMediaUsage(url: string): Promise<string[]> {
  const db = getDb();
  const usages: string[] = [];

  const bannerRow = await db
    .prepare(`SELECT value FROM site_settings WHERE key = 'banner_url'`)
    .first<{ value: string }>();
  if (bannerRow?.value === url) usages.push("Homepage banner");

  const services = await db
    .prepare(`SELECT name FROM services WHERE featured_image = ? OR og_image = ?`)
    .bind(url, url)
    .all<{ name: string }>();
  for (const s of services.results || []) usages.push(`Service: ${s.name}`);

  const posts = await db
    .prepare(`SELECT title FROM blog_posts WHERE featured_image = ? OR og_image = ?`)
    .bind(url, url)
    .all<{ title: string }>();
  for (const p of posts.results || []) usages.push(`Blog post: ${p.title}`);

  const sections = await db
    .prepare(`SELECT section_key FROM homepage_sections WHERE image_url = ?`)
    .bind(url)
    .all<{ section_key: string }>();
  for (const s of sections.results || []) usages.push(`Homepage section: ${s.section_key}`);

  const testimonials = await db
    .prepare(`SELECT name FROM testimonials WHERE photo_url = ?`)
    .bind(url)
    .all<{ name: string }>();
  for (const t of testimonials.results || []) usages.push(`Testimonial: ${t.name}`);

  // Package review images are stored as a JSON array rather than a single
  // column, so a plain `= ?` match won't find them — LIKE against the raw
  // JSON text is a safe, good-enough check for this admin warning (it can
  // only under- or over-warn, never silently delete something in use).
  const reviewImages = await db
    .prepare(`SELECT customer_name FROM package_reviews WHERE images_json LIKE ?`)
    .bind(`%${url}%`)
    .all<{ customer_name: string }>();
  for (const r of reviewImages.results || []) usages.push(`Package review photo: ${r.customer_name}`);

  const seo = await db
    .prepare(`SELECT id FROM seo_settings WHERE id = 1 AND (default_og_image = ? OR logo_url = ?)`)
    .bind(url, url)
    .first();
  if (seo) usages.push("Site SEO / logo settings");

  return usages;
}
