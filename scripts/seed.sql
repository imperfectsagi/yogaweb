-- Development seed data for Yoga Fit with Meenu
-- Clearly marked as demo/seed. Remove or replace before production.

-- Theme defaults
INSERT OR IGNORE INTO theme_settings (id) VALUES (1);

-- SEO defaults
INSERT OR IGNORE INTO seo_settings (id, site_name, default_title, default_description, organization_name)
VALUES (
  1,
  'Yoga Fit with Meenu',
  'Yoga Classes in Delhi NCR | Yoga Fit with Meenu',
  'Improve movement, flexibility, strength, mindfulness and wellbeing with yoga classes by Meenu in Delhi NCR. Group, personal and online classes available.',
  'Yoga Fit with Meenu'
);

-- Homepage sections (enabled by default)
INSERT OR IGNORE INTO homepage_sections (id, section_key, enabled, sort_order, heading, description, cta_text, cta_url) VALUES
('hs-hero', 'hero', 1, 10, 'Yoga Classes in Delhi NCR', 'Improve movement, flexibility, strength and mindfulness with Meenu.', 'Book a Free Class', '/free-class'),
('hs-benefits', 'benefits', 1, 20, 'Why Practice Yoga?', 'Build strength, flexibility, balance and calm through regular practice.', NULL, NULL),
('hs-services', 'services', 1, 30, 'Our Services', 'Group, personal and online yoga classes tailored to your needs.', 'View Services', '/services'),
('hs-about', 'about', 1, 40, 'Meet Meenu', 'Dedicated yoga teacher helping students in Delhi NCR improve wellbeing through yoga.', 'About Meenu', '/about'),
('hs-packages', 'packages', 1, 50, 'Classes & Packages', 'Flexible options for beginners and regular practitioners.', 'See Pricing', '/pricing'),
('hs-why', 'why-us', 1, 60, 'Why Yoga Fit with Meenu', 'Personal attention, clear guidance and a calm, supportive environment.', NULL, NULL),
('hs-testimonials', 'testimonials', 1, 70, 'What Students Say', NULL, NULL, NULL),
('hs-faq', 'faq', 1, 80, 'Frequently Asked Questions', NULL, NULL, NULL),
('hs-blog', 'blog', 1, 90, 'From the Blog', 'Tips, guidance and inspiration for your yoga journey.', 'Read Blog', '/blog'),
('hs-location', 'location', 1, 100, 'Serving Delhi NCR', 'Based in Badarpur, New Delhi. Classes available across Delhi NCR and online.', NULL, NULL),
('hs-contact', 'contact-cta', 1, 110, 'Ready to Start?', 'Get in touch or book a free introductory class.', 'Contact Us', '/contact');

-- Example services (draft/published for demo)
INSERT OR IGNORE INTO services (id, name, slug, short_description, full_description, online_available, offline_available, service_area, price_starting_from, cta_text, published, sort_order, published_at) VALUES
('svc-group', 'Group Yoga Classes', 'group-yoga-classes',
 'Practice together in a supportive group setting.',
 'Group yoga classes focused on alignment, breath and mindful movement. Suitable for beginners and intermediate practitioners. Classes held offline in Delhi NCR and available online.',
 1, 1, 'Delhi NCR', 'Contact for details', 'Enquire Now', 1, 10, datetime('now')),
('svc-personal', 'Personal / One-to-One Yoga Classes', 'personal-yoga-classes',
 'Individual attention tailored to your body and goals.',
 'One-to-one sessions allow focused guidance on posture, flexibility, strength and any specific needs. Available offline and online.',
 1, 1, 'Delhi NCR', 'Contact for details', 'Book a Session', 1, 20, datetime('now')),
('svc-online', 'Online Yoga Classes', 'online-yoga-classes',
 'Practice from the comfort of your home.',
 'Live online yoga classes with clear instruction and modifications. Join from anywhere in India or abroad.',
 1, 0, 'Online', 'Contact for details', 'Join Online', 1, 30, datetime('now')),
('svc-beginners', 'Yoga for Beginners', 'yoga-for-beginners',
 'Gentle introduction to yoga for complete beginners.',
 'A supportive start to yoga focusing on basic postures, breathing and body awareness. No prior experience required.',
 1, 1, 'Delhi NCR', 'Contact for details', 'Start Here', 1, 40, datetime('now'));

-- Example packages (placeholder prices - update in admin)
INSERT OR IGNORE INTO packages (id, name, description, price, original_price, currency, number_of_classes, class_duration, package_duration, online_available, offline_available, features_json, is_popular, is_active, sort_order, cta_text) VALUES
('pkg-trial', 'Trial Class', 'Single introductory class to experience the teaching style.', 0, NULL, 'INR', 1, '60 min', 'One class', 1, 1, '["One session","All levels","Online or Offline"]', 0, 1, 10, 'Book Free / Trial'),
('pkg-monthly', 'Monthly Group Classes', 'Regular group practice with consistent guidance.', 0, NULL, 'INR', 8, '60 min', '1 month', 1, 1, '["8 group classes","Flexible timing","Beginner friendly"]', 1, 1, 20, 'Enquire'),
('pkg-personal', 'Personal Sessions Pack', 'Focused one-to-one attention.', 0, NULL, 'INR', 4, '60 min', 'Valid 45 days', 1, 1, '["4 personal sessions","Custom plan","Online or Offline"]', 0, 1, 30, 'Enquire');

-- Example FAQs
INSERT OR IGNORE INTO faqs (id, question, answer, sort_order, published, show_on_homepage) VALUES
('faq-1', 'Do I need prior experience to join?', 'No. We welcome complete beginners. Classes include clear guidance and modifications so you can practice safely at your own pace.', 10, 1, 1),
('faq-2', 'Are classes available online?', 'Yes. Online live classes are available in addition to offline sessions in Delhi NCR.', 20, 1, 1),
('faq-3', 'What should I bring to class?', 'Comfortable clothing you can move in, a yoga mat (if you have one), and a water bottle. Mats may be available at the venue – please confirm when you book.', 30, 1, 1),
('faq-4', 'Where are offline classes held?', 'Offline classes are based in the Badarpur / Jaitpur area of New Delhi (I-55, Gali No. 2, Jaitpur, Badarpur). Service area covers Delhi NCR. Exact venue details are shared on booking.', 40, 1, 1);

-- Example blog category + post
INSERT OR IGNORE INTO blog_categories (id, name, slug, description) VALUES
('cat-tips', 'Yoga Tips', 'yoga-tips', 'Practical guidance for your practice');

INSERT OR IGNORE INTO blog_posts (id, title, slug, excerpt, content, category_id, published, published_at, reading_time, seo_title, seo_description) VALUES
('post-1', 'Getting Started with Yoga as a Beginner', 'getting-started-with-yoga-beginner',
 'A simple guide to beginning your yoga journey with confidence and safety.',
 '<p>Starting yoga can feel exciting and a little uncertain. The good news is you do not need to be flexible or strong to begin.</p><p>Focus on showing up consistently, listening to your body, and following clear guidance from a teacher. Breath awareness and basic standing and seated postures form a solid foundation.</p><p>If you are in Delhi NCR, group or personal classes with Meenu can help you start safely.</p>',
 'cat-tips', 1, datetime('now'), 3,
 'Getting Started with Yoga as a Beginner | Yoga Fit with Meenu',
 'Practical tips for complete beginners who want to start yoga safely and build a sustainable practice.');

-- Navigation
INSERT OR IGNORE INTO navigation (id, location, label, url, sort_order, is_active) VALUES
('nav-home', 'main', 'Home', '/', 10, 1),
('nav-about', 'main', 'About', '/about', 20, 1),
('nav-services', 'main', 'Services', '/services', 30, 1),
('nav-pricing', 'main', 'Pricing', '/pricing', 40, 1),
('nav-blog', 'main', 'Blog', '/blog', 50, 1),
('nav-contact', 'main', 'Contact', '/contact', 60, 1),
('nav-free', 'main', 'Free Class', '/free-class', 70, 1),
('foot-privacy', 'footer', 'Privacy Policy', '/privacy-policy', 10, 1),
('foot-terms', 'footer', 'Terms', '/terms-and-conditions', 20, 1),
('foot-faq', 'footer', 'FAQ', '/faq', 30, 1);

-- Note: No fake testimonials or ratings are seeded.
-- Create a real admin user via the setup script or first login flow after hashing the password.
