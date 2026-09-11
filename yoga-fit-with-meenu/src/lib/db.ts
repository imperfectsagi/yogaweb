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
  const { results } = await db
    .prepare(
      `SELECT * FROM homepage_sections WHERE enabled = 1 ORDER BY sort_order ASC`
    )
    .all();
  return results || [];
}

export async function getTheme() {
  const db = getDb();
  return db.prepare(`SELECT * FROM theme_settings WHERE id = 1`).first();
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
};

export async function getBannerSettings(): Promise<BannerSettings> {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT key, value FROM site_settings WHERE key IN
       ('banner_type','banner_media_id','banner_url','banner_poster_url','banner_alt_text')`
    )
    .all<{ key: string; value: string }>();
  const map = Object.fromEntries((results || []).map((r) => [r.key, r.value]));
  return {
    type: (map.banner_type as "image" | "video") || null,
    mediaId: map.banner_media_id || null,
    url: map.banner_url || null,
    posterUrl: map.banner_poster_url || null,
    altText: map.banner_alt_text || null,
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
