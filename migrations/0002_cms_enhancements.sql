-- Yoga Fit with Meenu - CMS Enhancements
-- Additive only. Safe to run on a database that already has 0001 applied
-- and already contains production data. Uses IF NOT EXISTS / OR IGNORE
-- throughout so it is idempotent.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Banner positioning (object-position control for the homepage hero).
-- Existing banner_* keys already live in site_settings (key/value), so no
-- schema change is needed there -- this just documents the additional keys
-- the app now reads/writes via site_settings:
--   banner_focal_x        ("0".."100", default "50")
--   banner_focal_y        ("0".."100", default "50")
--   banner_fit             ("cover" | "contain", default "cover")
-- No DDL required for these; INSERT is handled by the app on save.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Static content pages editable from the admin (About, Contact, Free Class,
-- Privacy Policy, Terms & Conditions). The `pages` table already exists
-- (0001) with slug/title/content/SEO columns -- we just seed the rows these
-- pages will read from if they don't already exist, so existing content in
-- a production DB is never overwritten.
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO pages (id, slug, title, content, seo_title, seo_description, published) VALUES
('page-about', 'about', 'About Meenu',
 '{"intro":"Yoga Fit with Meenu is dedicated to helping individuals improve movement, flexibility, strength, mindfulness and general wellbeing through yoga.","body":"Meenu teaches group classes, personal one-to-one sessions, and online classes for students in Delhi NCR and beyond. Classes are suitable for beginners as well as those with prior experience.\n\nThe teaching approach focuses on clear guidance, safe alignment and a calm, supportive environment so you can build a sustainable practice."}',
 'About Meenu | Yoga Fit with Meenu',
 'Meet Meenu, yoga teacher offering group, personal and online yoga classes in Delhi NCR.', 1),
('page-contact', 'contact', 'Contact',
 '{"intro":"Reach out by phone, WhatsApp or email. For the fastest response, WhatsApp is preferred."}',
 'Contact | Yoga Fit with Meenu',
 'Contact Meenu for yoga classes in Delhi NCR. Call, WhatsApp or email.', 1),
('page-free-class', 'free-class', 'Book a Free Class',
 '{"intro":"Experience a class with Meenu at no cost. Message on WhatsApp \u2014 no long form required."}',
 'Free Yoga Class | Yoga Fit with Meenu',
 'Book a free introductory yoga class with Meenu in Delhi NCR or online.', 1),
('page-privacy-policy', 'privacy-policy', 'Privacy Policy',
 '{"body":"Yoga Fit with Meenu (\"we\", \"us\") respects your privacy. This policy describes how we handle information when you use our website.\n\n## Information we collect\nWhen you contact us via forms, WhatsApp, phone or email, we may collect your name, phone number, email address and any message you send so we can respond to your enquiry.\n\n## How we use information\nWe use contact details only to respond to enquiries, schedule classes and improve our services. We do not sell personal data."}',
 'Privacy Policy | Yoga Fit with Meenu', NULL, 1),
('page-terms-and-conditions', 'terms-and-conditions', 'Terms and Conditions',
 '{"body":"By using this website and enquiring about or attending classes, you agree to these terms.\n\n## Classes\nClass timings, locations and fees are confirmed at the time of booking. We recommend consulting a doctor before starting any new physical activity if you have health concerns.\n\n## No medical claims\nYoga is offered for general wellbeing, movement and mindfulness. We do not claim to cure, treat or diagnose medical conditions."}',
 'Terms and Conditions | Yoga Fit with Meenu', NULL, 1);

-- ---------------------------------------------------------------------------
-- Default site_settings rows for the new Settings admin screen. OR IGNORE
-- means a production DB that already has these keys set is left untouched.
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('site_logo_url', ''),
  ('site_whatsapp_message', 'Hi Meenu, I would like to attend a free yoga class. Please share the details.'),
  ('social_instagram', ''),
  ('social_facebook', ''),
  ('social_youtube', ''),
  ('business_hours', ''),
  ('banner_focal_x', '50'),
  ('banner_focal_y', '50'),
  ('banner_fit', 'cover');

-- ---------------------------------------------------------------------------
-- seo_settings: ensure the singleton row exists (0001 seed already did this
-- via scripts/seed.sql, but a production DB created before that script ran
-- may not have it -- this is a safe no-op if it already exists).
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO seo_settings (id, site_name, default_title, default_description, organization_name)
VALUES (1, 'Yoga Fit with Meenu', 'Yoga Classes in Delhi NCR | Yoga Fit with Meenu',
 'Improve movement, flexibility, strength, mindfulness and wellbeing with yoga classes by Meenu in Delhi NCR.',
 'Yoga Fit with Meenu');

-- ---------------------------------------------------------------------------
-- theme_settings: ensure singleton row exists.
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO theme_settings (id) VALUES (1);
