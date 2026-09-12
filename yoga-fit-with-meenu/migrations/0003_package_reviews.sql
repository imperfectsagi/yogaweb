-- Yoga Fit with Meenu - Package Reviews
-- Additive only. Safe to run on a database that already has 0001 and 0002
-- applied and already contains production data.
--
-- Adds a review system scoped to pricing PACKAGES (separate from the
-- existing general-purpose `testimonials` table, which powers the
-- homepage "What Students Say" carousel and is not tied to a specific
-- package or rating). Package reviews support:
--   - a 1-5 star rating
--   - up to several photo URLs per review (images_json, a JSON array)
--   - a moderation workflow: every public submission starts as 'pending'
--     and only becomes visible on the site once an admin approves it
--   - reviews the admin adds directly from the dashboard (is_admin_created)
--     so real testimonials collected offline (WhatsApp, in person, etc.)
--     can be entered without pretending they came through the public form

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS package_reviews (
  id TEXT PRIMARY KEY,
  package_id TEXT NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  images_json TEXT, -- JSON array of image URLs, e.g. ["https://.../a.jpg"]
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_admin_created INTEGER NOT NULL DEFAULT 0,
  admin_note TEXT, -- optional internal note (not shown publicly)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_package_reviews_package ON package_reviews(package_id, status);
CREATE INDEX IF NOT EXISTS idx_package_reviews_status ON package_reviews(status, created_at);
