-- Yoga Fit with Meenu - Homepage package selection
-- Additive only. Safe to run on a database that already has 0001-0003
-- applied and already contains production data. Does not touch, rename or
-- rebuild the `packages` table (so its existing foreign keys, e.g.
-- package_reviews.package_id -> packages.id ON DELETE CASCADE, and its
-- existing rows/sort_order are completely undisturbed) -- it only adds two
-- new columns.
--
-- Adds explicit admin control over which packages show in the homepage
-- "Classes & Packages" section, and in what order, independent of price,
-- id, creation date or the Pricing page's own sort_order (the Pricing page
-- keeps using sort_order/is_active exactly as before and is not affected
-- by this migration).
--
--   show_on_homepage      0/1, default 0 (nothing shows on the homepage
--                          until an admin explicitly opts a package in)
--   homepage_sort_order   integer, default 0 (admin-controlled display
--                          order among the packages selected for the
--                          homepage, independent of the Pricing page's
--                          own sort_order)
--
-- SQLite has no `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. Run this file
-- once per database (same as 0001-0003). Re-running it against a database
-- that already has these columns will fail with a clear
-- "duplicate column name" error and make no changes -- it cannot corrupt
-- or lose existing data, so it's safe to simply not re-run it rather than
-- needing special handling.

PRAGMA foreign_keys = ON;

ALTER TABLE packages ADD COLUMN show_on_homepage INTEGER NOT NULL DEFAULT 0;
ALTER TABLE packages ADD COLUMN homepage_sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_packages_homepage ON packages(show_on_homepage, homepage_sort_order);
