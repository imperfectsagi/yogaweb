-- Yoga Fit with Meenu - Initial Schema
-- Safe, non-destructive migrations

PRAGMA foreign_keys = ON;

-- Users (admin / editor)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Site settings (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Theme settings
CREATE TABLE IF NOT EXISTS theme_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  primary_color TEXT NOT NULL DEFAULT '#2D5A4A',
  secondary_color TEXT NOT NULL DEFAULT '#8B7355',
  accent_color TEXT NOT NULL DEFAULT '#C4A484',
  background_color TEXT NOT NULL DEFAULT '#FAF8F5',
  foreground_color TEXT NOT NULL DEFAULT '#1A1A1A',
  muted_color TEXT NOT NULL DEFAULT '#6B7280',
  border_color TEXT NOT NULL DEFAULT '#E5E0D8',
  button_radius TEXT NOT NULL DEFAULT '0.5rem',
  card_radius TEXT NOT NULL DEFAULT '0.75rem',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Homepage sections
CREATE TABLE IF NOT EXISTS homepage_sections (
  id TEXT PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  heading TEXT,
  description TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_url TEXT,
  config_json TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(sort_order);

-- Pages (static pages SEO etc.)
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  robots_index INTEGER NOT NULL DEFAULT 1,
  robots_follow INTEGER NOT NULL DEFAULT 1,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  full_description TEXT,
  featured_image TEXT,
  gallery_json TEXT,
  benefits_json TEXT,
  who_it_is_for TEXT,
  duration TEXT,
  online_available INTEGER NOT NULL DEFAULT 1,
  offline_available INTEGER NOT NULL DEFAULT 1,
  service_area TEXT DEFAULT 'Delhi NCR',
  price_starting_from TEXT,
  cta_text TEXT DEFAULT 'Book a Class',
  cta_url TEXT,
  faqs_json TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  robots_index INTEGER NOT NULL DEFAULT 1,
  robots_follow INTEGER NOT NULL DEFAULT 1,
  published INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_published ON services(published, sort_order);

-- Packages / Pricing
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  original_price REAL,
  currency TEXT NOT NULL DEFAULT 'INR',
  number_of_classes INTEGER,
  class_duration TEXT,
  package_duration TEXT,
  online_available INTEGER NOT NULL DEFAULT 1,
  offline_available INTEGER NOT NULL DEFAULT 1,
  features_json TEXT,
  is_popular INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cta_text TEXT DEFAULT 'Get Started',
  cta_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active, sort_order);

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Blog tags
CREATE TABLE IF NOT EXISTS blog_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  author_id TEXT REFERENCES users(id),
  category_id TEXT REFERENCES blog_categories(id),
  published INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  reading_time INTEGER,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  robots_index INTEGER NOT NULL DEFAULT 1,
  robots_follow INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at);

-- Blog post tags junction
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Media library
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_media_mime ON media(mime_type);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  show_on_homepage INTEGER NOT NULL DEFAULT 0,
  service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  review TEXT NOT NULL,
  photo_url TEXT,
  location TEXT,
  service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
  published INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Leads / Enquiries
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  interested_service TEXT,
  preferred_mode TEXT,
  preferred_time TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'trial_scheduled', 'joined', 'not_interested', 'closed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, created_at);

-- SEO settings (global)
CREATE TABLE IF NOT EXISTS seo_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_name TEXT DEFAULT 'Yoga Fit with Meenu',
  default_title TEXT,
  default_description TEXT,
  default_og_image TEXT,
  organization_name TEXT DEFAULT 'Yoga Fit with Meenu',
  logo_url TEXT,
  social_profiles_json TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Redirects
CREATE TABLE IF NOT EXISTS redirects (
  id TEXT PRIMARY KEY,
  old_path TEXT NOT NULL UNIQUE,
  new_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_redirects_old ON redirects(old_path);

-- Navigation
CREATE TABLE IF NOT EXISTS navigation (
  id TEXT PRIMARY KEY,
  location TEXT NOT NULL CHECK (location IN ('main', 'footer', 'mobile')),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_external INTEGER NOT NULL DEFAULT 0,
  parent_id TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_navigation_location ON navigation(location, sort_order);
