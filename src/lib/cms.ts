/**
 * Admin CMS data-access layer.
 *
 * These helpers sit alongside src/lib/db.ts (which holds the *public*,
 * published-only queries + core bindings). Everything here is used from
 * admin API routes only, behind requireAdmin(), and generally reads/writes
 * unpublished rows too so editors can preview drafts.
 */

import { getDb, getSiteSetting } from "./db";

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  featured_image: string | null;
  gallery_json: string | null;
  benefits_json: string | null;
  who_it_is_for: string | null;
  duration: string | null;
  online_available: number;
  offline_available: number;
  service_area: string | null;
  price_starting_from: string | null;
  cta_text: string | null;
  cta_url: string | null;
  faqs_json: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  robots_index: number;
  robots_follow: number;
  published: number;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function adminListServices(): Promise<ServiceRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM services ORDER BY sort_order ASC, created_at DESC`)
    .all<ServiceRow>();
  return results || [];
}

export async function adminGetService(id: string): Promise<ServiceRow | null> {
  const db = getDb();
  return db.prepare(`SELECT * FROM services WHERE id = ?`).bind(id).first<ServiceRow>();
}

export async function adminGetServiceBySlugExcludingId(
  slug: string,
  excludeId?: string
): Promise<{ id: string } | null> {
  const db = getDb();
  if (excludeId) {
    return db
      .prepare(`SELECT id FROM services WHERE slug = ? AND id != ?`)
      .bind(slug, excludeId)
      .first();
  }
  return db.prepare(`SELECT id FROM services WHERE slug = ?`).bind(slug).first();
}

export type ServiceInput = Omit<
  ServiceRow,
  "id" | "created_at" | "updated_at" | "published_at"
>;

export async function adminCreateService(data: ServiceInput): Promise<string> {
  const db = getDb();
  const id = newId("svc");
  await db
    .prepare(
      `INSERT INTO services (
        id, name, slug, short_description, full_description, featured_image,
        gallery_json, benefits_json, who_it_is_for, duration, online_available,
        offline_available, service_area, price_starting_from, cta_text, cta_url,
        faqs_json, seo_title, seo_description, canonical_url, og_image,
        robots_index, robots_follow, published, sort_order, published_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(
      id,
      data.name,
      data.slug,
      data.short_description,
      data.full_description,
      data.featured_image,
      data.gallery_json,
      data.benefits_json,
      data.who_it_is_for,
      data.duration,
      data.online_available,
      data.offline_available,
      data.service_area,
      data.price_starting_from,
      data.cta_text,
      data.cta_url,
      data.faqs_json,
      data.seo_title,
      data.seo_description,
      data.canonical_url,
      data.og_image,
      data.robots_index,
      data.robots_follow,
      data.published,
      data.sort_order,
      data.published ? new Date().toISOString() : null
    )
    .run();
  return id;
}

export async function adminUpdateService(id: string, data: ServiceInput): Promise<void> {
  const db = getDb();
  const existing = await adminGetService(id);
  const publishedAt =
    data.published && !existing?.published_at
      ? new Date().toISOString()
      : existing?.published_at || null;

  await db
    .prepare(
      `UPDATE services SET
        name = ?, slug = ?, short_description = ?, full_description = ?,
        featured_image = ?, gallery_json = ?, benefits_json = ?, who_it_is_for = ?,
        duration = ?, online_available = ?, offline_available = ?, service_area = ?,
        price_starting_from = ?, cta_text = ?, cta_url = ?, faqs_json = ?,
        seo_title = ?, seo_description = ?, canonical_url = ?, og_image = ?,
        robots_index = ?, robots_follow = ?, published = ?, sort_order = ?,
        published_at = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      data.name,
      data.slug,
      data.short_description,
      data.full_description,
      data.featured_image,
      data.gallery_json,
      data.benefits_json,
      data.who_it_is_for,
      data.duration,
      data.online_available,
      data.offline_available,
      data.service_area,
      data.price_starting_from,
      data.cta_text,
      data.cta_url,
      data.faqs_json,
      data.seo_title,
      data.seo_description,
      data.canonical_url,
      data.og_image,
      data.robots_index,
      data.robots_follow,
      data.published,
      data.sort_order,
      publishedAt,
      id
    )
    .run();
}

export async function adminDeleteService(id: string): Promise<void> {
  const db = getDb();
  await db.prepare(`DELETE FROM services WHERE id = ?`).bind(id).run();
}

// ---------------------------------------------------------------------------
// Packages / Pricing
// ---------------------------------------------------------------------------

export type PackageRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  number_of_classes: number | null;
  class_duration: string | null;
  package_duration: string | null;
  online_available: number;
  offline_available: number;
  features_json: string | null;
  is_popular: number;
  is_active: number;
  sort_order: number;
  cta_text: string | null;
  cta_url: string | null;
  // Independent of sort_order/is_active (which the Pricing page uses to
  // show every active package): whether this package is one of the ones
  // hand-picked to appear in the homepage "Classes & Packages" section,
  // and where in that specific list it should appear.
  show_on_homepage: number;
  homepage_sort_order: number;
  created_at: string;
  updated_at: string;
};

export async function adminListPackages(): Promise<PackageRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM packages ORDER BY sort_order ASC, created_at DESC`)
    .all<PackageRow>();
  return results || [];
}

export async function adminGetPackage(id: string): Promise<PackageRow | null> {
  const db = getDb();
  return db.prepare(`SELECT * FROM packages WHERE id = ?`).bind(id).first<PackageRow>();
}

export type PackageInput = Omit<PackageRow, "id" | "created_at" | "updated_at">;

export async function adminCreatePackage(data: PackageInput): Promise<string> {
  const db = getDb();
  const id = newId("pkg");
  await db
    .prepare(
      `INSERT INTO packages (
        id, name, description, price, original_price, currency, number_of_classes,
        class_duration, package_duration, online_available, offline_available,
        features_json, is_popular, is_active, sort_order, cta_text, cta_url,
        show_on_homepage, homepage_sort_order
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(
      id,
      data.name,
      data.description,
      data.price,
      data.original_price,
      data.currency,
      data.number_of_classes,
      data.class_duration,
      data.package_duration,
      data.online_available,
      data.offline_available,
      data.features_json,
      data.is_popular,
      data.is_active,
      data.sort_order,
      data.cta_text,
      data.cta_url,
      data.show_on_homepage,
      data.homepage_sort_order
    )
    .run();
  return id;
}

export async function adminUpdatePackage(id: string, data: PackageInput): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `UPDATE packages SET
        name = ?, description = ?, price = ?, original_price = ?, currency = ?,
        number_of_classes = ?, class_duration = ?, package_duration = ?,
        online_available = ?, offline_available = ?, features_json = ?,
        is_popular = ?, is_active = ?, sort_order = ?, cta_text = ?, cta_url = ?,
        show_on_homepage = ?, homepage_sort_order = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      data.name,
      data.description,
      data.price,
      data.original_price,
      data.currency,
      data.number_of_classes,
      data.class_duration,
      data.package_duration,
      data.online_available,
      data.offline_available,
      data.features_json,
      data.is_popular,
      data.is_active,
      data.sort_order,
      data.cta_text,
      data.cta_url,
      data.show_on_homepage,
      data.homepage_sort_order,
      id
    )
    .run();
}

export async function adminDeletePackage(id: string): Promise<void> {
  const db = getDb();
  await db.prepare(`DELETE FROM packages WHERE id = ?`).bind(id).run();
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: number;
  show_on_homepage: number;
  service_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function adminListFaqs(): Promise<FaqRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM faqs ORDER BY sort_order ASC, created_at DESC`)
    .all<FaqRow>();
  return results || [];
}

export async function adminGetFaq(id: string): Promise<FaqRow | null> {
  const db = getDb();
  return db.prepare(`SELECT * FROM faqs WHERE id = ?`).bind(id).first<FaqRow>();
}

export type FaqInput = Omit<FaqRow, "id" | "created_at" | "updated_at">;

export async function adminCreateFaq(data: FaqInput): Promise<string> {
  const db = getDb();
  const id = newId("faq");
  await db
    .prepare(
      `INSERT INTO faqs (id, question, answer, sort_order, published, show_on_homepage, service_id)
       VALUES (?,?,?,?,?,?,?)`
    )
    .bind(
      id,
      data.question,
      data.answer,
      data.sort_order,
      data.published,
      data.show_on_homepage,
      data.service_id
    )
    .run();
  return id;
}

export async function adminUpdateFaq(id: string, data: FaqInput): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `UPDATE faqs SET question = ?, answer = ?, sort_order = ?, published = ?,
        show_on_homepage = ?, service_id = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      data.question,
      data.answer,
      data.sort_order,
      data.published,
      data.show_on_homepage,
      data.service_id,
      id
    )
    .run();
}

export async function adminDeleteFaq(id: string): Promise<void> {
  const db = getDb();
  await db.prepare(`DELETE FROM faqs WHERE id = ?`).bind(id).run();
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export type TestimonialRow = {
  id: string;
  name: string;
  review: string;
  photo_url: string | null;
  location: string | null;
  service_id: string | null;
  published: number;
  sort_order: number;
  created_at: string;
};

export async function adminListTestimonials(): Promise<TestimonialRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC`)
    .all<TestimonialRow>();
  return results || [];
}

export async function adminGetTestimonial(id: string): Promise<TestimonialRow | null> {
  const db = getDb();
  return db.prepare(`SELECT * FROM testimonials WHERE id = ?`).bind(id).first<TestimonialRow>();
}

export type TestimonialInput = Omit<TestimonialRow, "id" | "created_at">;

export async function adminCreateTestimonial(data: TestimonialInput): Promise<string> {
  const db = getDb();
  const id = newId("test");
  await db
    .prepare(
      `INSERT INTO testimonials (id, name, review, photo_url, location, service_id, published, sort_order)
       VALUES (?,?,?,?,?,?,?,?)`
    )
    .bind(
      id,
      data.name,
      data.review,
      data.photo_url,
      data.location,
      data.service_id,
      data.published,
      data.sort_order
    )
    .run();
  return id;
}

export async function adminUpdateTestimonial(id: string, data: TestimonialInput): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `UPDATE testimonials SET name = ?, review = ?, photo_url = ?, location = ?,
        service_id = ?, published = ?, sort_order = ? WHERE id = ?`
    )
    .bind(
      data.name,
      data.review,
      data.photo_url,
      data.location,
      data.service_id,
      data.published,
      data.sort_order,
      id
    )
    .run();
}

export async function adminDeleteTestimonial(id: string): Promise<void> {
  const db = getDb();
  await db.prepare(`DELETE FROM testimonials WHERE id = ?`).bind(id).run();
}

export async function getPublishedTestimonials(): Promise<TestimonialRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM testimonials WHERE published = 1 ORDER BY sort_order ASC`)
    .all<TestimonialRow>();
  return results || [];
}

// ---------------------------------------------------------------------------
// Package reviews (admin: sees every status, can create/edit/delete/moderate)
// ---------------------------------------------------------------------------

export type PackageReviewRow = {
  id: string;
  package_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  images_json: string | null;
  status: "pending" | "approved" | "rejected";
  is_admin_created: number;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

/** Admin list view also joins the package name so the list screen doesn't
 * need a second round-trip per row. */
export type PackageReviewWithPackage = PackageReviewRow & { package_name: string | null };

export async function adminListPackageReviews(): Promise<PackageReviewWithPackage[]> {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT r.*, p.name as package_name
       FROM package_reviews r
       LEFT JOIN packages p ON p.id = r.package_id
       ORDER BY
         CASE r.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
         r.created_at DESC`
    )
    .all<PackageReviewWithPackage>();
  return results || [];
}

export async function adminGetPackageReview(id: string): Promise<PackageReviewRow | null> {
  const db = getDb();
  return db.prepare(`SELECT * FROM package_reviews WHERE id = ?`).bind(id).first<PackageReviewRow>();
}

export type PackageReviewInput = {
  package_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  images_json: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
};

/** Reviews created here (from Admin → Reviews → New) are marked
 * is_admin_created = 1 and default to 'approved' unless a different status
 * is explicitly requested, since an admin typing a review in directly is
 * presumed to already be a real, vetted review — not something awaiting
 * moderation the way a public form submission is. */
export async function adminCreatePackageReview(data: PackageReviewInput): Promise<string> {
  const db = getDb();
  const id = `rev-${crypto.randomUUID().slice(0, 8)}`;
  await db
    .prepare(
      `INSERT INTO package_reviews (id, package_id, customer_name, rating, review_text, images_json, status, is_admin_created, admin_note)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`
    )
    .bind(
      id,
      data.package_id,
      data.customer_name,
      data.rating,
      data.review_text,
      data.images_json,
      data.status,
      data.admin_note
    )
    .run();
  return id;
}

export async function adminUpdatePackageReview(id: string, data: PackageReviewInput): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `UPDATE package_reviews SET
        package_id = ?, customer_name = ?, rating = ?, review_text = ?,
        images_json = ?, status = ?, admin_note = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      data.package_id,
      data.customer_name,
      data.rating,
      data.review_text,
      data.images_json,
      data.status,
      data.admin_note,
      id
    )
    .run();
}

/** Lightweight status-only update for the Approve/Reject quick actions on
 * the list screen, so a moderator doesn't need to open the full edit form
 * just to approve a review. */
export async function adminSetPackageReviewStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
): Promise<void> {
  const db = getDb();
  await db
    .prepare(`UPDATE package_reviews SET status = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(status, id)
    .run();
}

export async function adminDeletePackageReview(id: string): Promise<void> {
  const db = getDb();
  await db.prepare(`DELETE FROM package_reviews WHERE id = ?`).bind(id).run();
}

// ---------------------------------------------------------------------------
// Blog posts + categories
// ---------------------------------------------------------------------------

export type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  author_id: string | null;
  category_id: string | null;
  published: number;
  published_at: string | null;
  reading_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  robots_index: number;
  robots_follow: number;
  created_at: string;
  updated_at: string;
};

export async function adminListPosts(): Promise<BlogPostRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM blog_posts ORDER BY created_at DESC`)
    .all<BlogPostRow>();
  return results || [];
}

export async function adminGetPost(id: string): Promise<BlogPostRow | null> {
  const db = getDb();
  return db.prepare(`SELECT * FROM blog_posts WHERE id = ?`).bind(id).first<BlogPostRow>();
}

export type BlogPostInput = Omit<
  BlogPostRow,
  "id" | "created_at" | "updated_at" | "author_id" | "published_at"
>;

export async function adminCreatePost(data: BlogPostInput, authorId?: string): Promise<string> {
  const db = getDb();
  const id = newId("post");
  await db
    .prepare(
      `INSERT INTO blog_posts (
        id, title, slug, excerpt, content, featured_image, author_id, category_id,
        published, published_at, reading_time, seo_title, seo_description,
        canonical_url, og_image, robots_index, robots_follow
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(
      id,
      data.title,
      data.slug,
      data.excerpt,
      data.content,
      data.featured_image,
      authorId || null,
      data.category_id,
      data.published,
      data.published ? new Date().toISOString() : null,
      data.reading_time,
      data.seo_title,
      data.seo_description,
      data.canonical_url,
      data.og_image,
      data.robots_index,
      data.robots_follow
    )
    .run();
  return id;
}

export async function adminUpdatePost(id: string, data: BlogPostInput): Promise<void> {
  const db = getDb();
  const existing = await adminGetPost(id);
  const publishedAt =
    data.published && !existing?.published_at
      ? new Date().toISOString()
      : existing?.published_at || null;

  await db
    .prepare(
      `UPDATE blog_posts SET
        title = ?, slug = ?, excerpt = ?, content = ?, featured_image = ?,
        category_id = ?, published = ?, published_at = ?, reading_time = ?,
        seo_title = ?, seo_description = ?, canonical_url = ?, og_image = ?,
        robots_index = ?, robots_follow = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      data.title,
      data.slug,
      data.excerpt,
      data.content,
      data.featured_image,
      data.category_id,
      data.published,
      publishedAt,
      data.reading_time,
      data.seo_title,
      data.seo_description,
      data.canonical_url,
      data.og_image,
      data.robots_index,
      data.robots_follow,
      id
    )
    .run();
}

export async function adminDeletePost(id: string): Promise<void> {
  const db = getDb();
  await db.prepare(`DELETE FROM blog_posts WHERE id = ?`).bind(id).run();
}

export type BlogCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export async function adminListCategories(): Promise<BlogCategoryRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM blog_categories ORDER BY name ASC`)
    .all<BlogCategoryRow>();
  return results || [];
}

export async function adminCreateCategory(name: string, slug: string, description?: string): Promise<string> {
  const db = getDb();
  const id = newId("cat");
  await db
    .prepare(`INSERT INTO blog_categories (id, name, slug, description) VALUES (?,?,?,?)`)
    .bind(id, name, slug, description || null)
    .run();
  return id;
}

export async function adminDeleteCategory(id: string): Promise<void> {
  const db = getDb();
  await db.prepare(`DELETE FROM blog_categories WHERE id = ?`).bind(id).run();
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export type NavigationRow = {
  id: string;
  location: "main" | "footer" | "mobile";
  label: string;
  url: string;
  sort_order: number;
  is_external: number;
  parent_id: string | null;
  is_active: number;
};

export async function adminListNavigation(): Promise<NavigationRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM navigation ORDER BY location ASC, sort_order ASC`)
    .all<NavigationRow>();
  return results || [];
}

export async function getActiveNavigation(location: "main" | "footer" | "mobile"): Promise<NavigationRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT * FROM navigation WHERE location = ? AND is_active = 1 ORDER BY sort_order ASC`
    )
    .bind(location)
    .all<NavigationRow>();
  return results || [];
}

export type NavigationInput = Omit<NavigationRow, "id">;

export async function adminCreateNavItem(data: NavigationInput): Promise<string> {
  const db = getDb();
  const id = newId("nav");
  await db
    .prepare(
      `INSERT INTO navigation (id, location, label, url, sort_order, is_external, parent_id, is_active)
       VALUES (?,?,?,?,?,?,?,?)`
    )
    .bind(
      id,
      data.location,
      data.label,
      data.url,
      data.sort_order,
      data.is_external,
      data.parent_id,
      data.is_active
    )
    .run();
  return id;
}

export async function adminUpdateNavItem(id: string, data: NavigationInput): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `UPDATE navigation SET location = ?, label = ?, url = ?, sort_order = ?,
        is_external = ?, parent_id = ?, is_active = ? WHERE id = ?`
    )
    .bind(
      data.location,
      data.label,
      data.url,
      data.sort_order,
      data.is_external,
      data.parent_id,
      data.is_active,
      id
    )
    .run();
}

export async function adminDeleteNavItem(id: string): Promise<void> {
  const db = getDb();
  await db.prepare(`DELETE FROM navigation WHERE id = ?`).bind(id).run();
}

// ---------------------------------------------------------------------------
// Theme settings
// ---------------------------------------------------------------------------

export type ThemeRow = {
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
};

export const DEFAULT_THEME: Omit<ThemeRow, "id" | "updated_at"> = {
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

export async function adminUpdateTheme(data: Omit<ThemeRow, "id" | "updated_at">): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `INSERT INTO theme_settings (
        id, primary_color, secondary_color, accent_color, background_color,
        foreground_color, muted_color, border_color, button_radius, card_radius, updated_at
      ) VALUES (1, ?,?,?,?,?,?,?,?,?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        primary_color = excluded.primary_color,
        secondary_color = excluded.secondary_color,
        accent_color = excluded.accent_color,
        background_color = excluded.background_color,
        foreground_color = excluded.foreground_color,
        muted_color = excluded.muted_color,
        border_color = excluded.border_color,
        button_radius = excluded.button_radius,
        card_radius = excluded.card_radius,
        updated_at = datetime('now')`
    )
    .bind(
      data.primary_color,
      data.secondary_color,
      data.accent_color,
      data.background_color,
      data.foreground_color,
      data.muted_color,
      data.border_color,
      data.button_radius,
      data.card_radius
    )
    .run();
}

// ---------------------------------------------------------------------------
// Homepage sections
// ---------------------------------------------------------------------------

export type HomepageSectionRow = {
  id: string;
  section_key: string;
  enabled: number;
  sort_order: number;
  heading: string | null;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  config_json: string | null;
  updated_at: string;
};

export async function adminListHomepageSections(): Promise<HomepageSectionRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM homepage_sections ORDER BY sort_order ASC`)
    .all<HomepageSectionRow>();
  return results || [];
}

export async function adminUpdateHomepageSection(
  id: string,
  data: {
    enabled: number;
    sort_order: number;
    heading: string | null;
    description: string | null;
    image_url: string | null;
    cta_text: string | null;
    cta_url: string | null;
  }
): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `UPDATE homepage_sections SET enabled = ?, sort_order = ?, heading = ?,
        description = ?, image_url = ?, cta_text = ?, cta_url = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(
      data.enabled,
      data.sort_order,
      data.heading,
      data.description,
      data.image_url,
      data.cta_text,
      data.cta_url,
      id
    )
    .run();
}

// ---------------------------------------------------------------------------
// Static content pages (About, Contact, Free Class, Privacy, Terms)
// ---------------------------------------------------------------------------

export type PageRow = {
  id: string;
  slug: string;
  title: string;
  content: string | null; // JSON string, shape depends on page
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  robots_index: number;
  robots_follow: number;
  published: number;
  created_at: string;
  updated_at: string;
};

export async function adminListPages(): Promise<PageRow[]> {
  const db = getDb();
  const { results } = await db.prepare(`SELECT * FROM pages ORDER BY slug ASC`).all<PageRow>();
  return results || [];
}

export async function adminGetPageBySlug(slug: string): Promise<PageRow | null> {
  const db = getDb();
  return db.prepare(`SELECT * FROM pages WHERE slug = ?`).bind(slug).first<PageRow>();
}

export async function getPageBySlug(slug: string): Promise<PageRow | null> {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM pages WHERE slug = ? AND published = 1`)
    .bind(slug)
    .first<PageRow>();
}

export async function adminUpdatePage(
  slug: string,
  data: {
    title: string;
    content: string;
    seo_title: string | null;
    seo_description: string | null;
    published: number;
  }
): Promise<void> {
  const db = getDb();
  const existing = await adminGetPageBySlug(slug);
  if (existing) {
    await db
      .prepare(
        `UPDATE pages SET title = ?, content = ?, seo_title = ?, seo_description = ?,
          published = ?, updated_at = datetime('now') WHERE slug = ?`
      )
      .bind(data.title, data.content, data.seo_title, data.seo_description, data.published, slug)
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO pages (id, slug, title, content, seo_title, seo_description, published)
         VALUES (?,?,?,?,?,?,?)`
      )
      .bind(newId("page"), slug, data.title, data.content, data.seo_title, data.seo_description, data.published)
      .run();
  }
}

// ---------------------------------------------------------------------------
// Global site settings (key/value) — logo, social links, business hours, etc.
// ---------------------------------------------------------------------------

export const SETTINGS_KEYS = [
  "site_logo_url",
  "site_favicon_url",
  "site_whatsapp_message",
  "social_instagram",
  "social_facebook",
  "social_youtube",
  "business_hours",
] as const;

export type SettingsMap = Record<(typeof SETTINGS_KEYS)[number], string>;

export async function getAllSiteSettings(): Promise<Partial<SettingsMap>> {
  const db = getDb();
  const placeholders = SETTINGS_KEYS.map(() => "?").join(",");
  const { results } = await db
    .prepare(`SELECT key, value FROM site_settings WHERE key IN (${placeholders})`)
    .bind(...SETTINGS_KEYS)
    .all<{ key: string; value: string }>();
  const map: Partial<SettingsMap> = {};
  for (const row of results || []) {
    (map as Record<string, string>)[row.key] = row.value;
  }
  return map;
}

// The message pre-filled into WhatsApp when a visitor taps a "Free Class"
// / "Book a Free Class" button anywhere on the site. Used by the homepage
// hero, the Free Class page, and the mobile bottom CTA bar, so it's
// defined once here rather than duplicated (and able to drift out of
// sync) across each of those files. Falls back to the original hardcoded
// copy if nothing has been saved yet in Admin → Settings → Site Settings,
// so a fresh install with no site_settings row behaves exactly as it did
// before this was made admin-editable.
const DEFAULT_WHATSAPP_MESSAGE =
  "Hi Meenu, I would like to attend a free yoga class. Please share the details.";

export async function getDefaultWhatsappMessage(): Promise<string> {
  try {
    const value = await getSiteSetting("site_whatsapp_message");
    return value || DEFAULT_WHATSAPP_MESSAGE;
  } catch {
    return DEFAULT_WHATSAPP_MESSAGE;
  }
}

export async function setSiteSettings(values: Partial<SettingsMap>): Promise<void> {
  const db = getDb();
  const entries = Object.entries(values).filter(([k]) =>
    (SETTINGS_KEYS as readonly string[]).includes(k)
  );
  if (!entries.length) return;
  const stmts = entries.map(([key, value]) =>
    db
      .prepare(
        `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
      )
      .bind(key, value ?? "")
  );
  await db.batch(stmts);
}

// ---------------------------------------------------------------------------
// SEO settings (global singleton)
// ---------------------------------------------------------------------------

export type SeoSettingsRow = {
  id: number;
  site_name: string | null;
  default_title: string | null;
  default_description: string | null;
  default_og_image: string | null;
  organization_name: string | null;
  logo_url: string | null;
  social_profiles_json: string | null;
  updated_at: string;
};

export async function getSeoSettings(): Promise<SeoSettingsRow | null> {
  const db = getDb();
  return db.prepare(`SELECT * FROM seo_settings WHERE id = 1`).first<SeoSettingsRow>();
}

export async function adminUpdateSeoSettings(data: {
  site_name: string;
  default_title: string;
  default_description: string;
  default_og_image: string | null;
  organization_name: string;
  logo_url: string | null;
}): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `INSERT INTO seo_settings (id, site_name, default_title, default_description, default_og_image, organization_name, logo_url, updated_at)
       VALUES (1, ?,?,?,?,?,?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         site_name = excluded.site_name,
         default_title = excluded.default_title,
         default_description = excluded.default_description,
         default_og_image = excluded.default_og_image,
         organization_name = excluded.organization_name,
         logo_url = excluded.logo_url,
         updated_at = datetime('now')`
    )
    .bind(
      data.site_name,
      data.default_title,
      data.default_description,
      data.default_og_image,
      data.organization_name,
      data.logo_url
    )
    .run();
}
