import Link from "next/link";
import Image from "next/image";
import { SITE, whatsappUrl, cn } from "@/lib/utils";
import { localBusinessJsonLd } from "@/lib/seo";
import { HomeBanner } from "@/components/HomeBanner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileCTA } from "@/components/MobileCTA";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  getHomepageSections,
  getPublishedServices,
  getHomepagePackages,
  getFaqs,
  getPublishedPosts,
  getBannerSettings,
} from "@/lib/db";
import { getPublishedTestimonials, getDefaultWhatsappMessage } from "@/lib/cms";

type Section = {
  section_key: string;
  enabled: number;
  heading: string | null;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
};

type ServiceCard = { slug: string; name: string; short_description: string | null };
type PackageCard = { id: string; name: string; description: string | null; price: number; currency: string; is_popular: number };
type FaqItem = { id: string; question: string; answer: string };
type PostCard = { id: string; title: string; slug: string; excerpt: string | null };
type Testimonial = { id: string; name: string; review: string; location: string | null; photo_url: string | null };

const BENEFIT_CARDS = [
  { title: "Movement & Flexibility", text: "Improve range of motion and ease of daily movement." },
  { title: "Strength", text: "Build functional strength through mindful postures." },
  { title: "Mindfulness", text: "Connect breath and body for greater awareness." },
  { title: "Wellbeing", text: "Support overall physical and mental wellbeing." },
];

function formatPrice(price: number, currency: string): string {
  if (price === 0) return "Free";
  const symbol = currency === "INR" ? "₹" : currency + " ";
  return `${symbol}${price.toLocaleString("en-IN")}`;
}

export default async function HomePage() {
  const lb = localBusinessJsonLd();

  let sections: Section[] = [];
  let services: ServiceCard[] = [];
  let packages: PackageCard[] = [];
  let faqs: FaqItem[] = [];
  let posts: PostCard[] = [];
  let testimonials: Testimonial[] = [];

  try {
    sections = (await getHomepageSections()) as unknown as Section[];
  } catch {
    sections = [];
  }
  const byKey = (key: string) => sections.find((s) => s.section_key === key);
  const isEnabled = (key: string) => byKey(key)?.enabled !== 0; // default to shown if unknown

  try {
    services = ((await getPublishedServices()) as unknown as ServiceCard[]).slice(0, 4);
  } catch {
    services = [];
  }
  try {
    // Homepage shows only the packages an admin explicitly selected (via
    // the "Show on Homepage" toggle on each package), in their
    // admin-chosen order — not automatically the first/cheapest/newest
    // ones. The Pricing page's own query (getActivePackages) is separate
    // and continues to show every active package, unaffected by this.
    packages = (await getHomepagePackages()) as unknown as PackageCard[];
  } catch {
    packages = [];
  }
  try {
    faqs = ((await getFaqs(true)) as unknown as FaqItem[]).slice(0, 5);
  } catch {
    faqs = [];
  }
  try {
    posts = ((await getPublishedPosts(3)) as unknown as PostCard[]);
  } catch {
    posts = [];
  }
  try {
    testimonials = (await getPublishedTestimonials()).slice(0, 6) as unknown as Testimonial[];
  } catch {
    testimonials = [];
  }

  // Pre-filled WhatsApp message for every "Book a Free Class" / "Free
  // Class" link on this page (hero CTA, mobile bottom bar) — saved from
  // Admin → Settings → Site Settings, with a built-in fallback if nothing
  // has been saved yet.
  const freeClassMsg = await getDefaultWhatsappMessage();

  // Whether a homepage banner is currently set — determines whether the
  // hero renders as a full-bleed photo/video background (light text,
  // overlaid header) or, with no banner uploaded, as the original plain
  // hero (dark text on the site's background color, normal header row).
  let hasBanner = false;
  try {
    const banner = await getBannerSettings();
    hasBanner = Boolean(banner?.url && banner.type);
  } catch {
    hasBanner = false;
  }

  const hero = byKey("hero");
  const benefits = byKey("benefits");
  const servicesSection = byKey("services");
  const about = byKey("about");
  const packagesSection = byKey("packages");
  const whyUs = byKey("why-us");
  const testimonialsSection = byKey("testimonials");
  const faqSection = byKey("faq");
  const blogSection = byKey("blog");
  const location = byKey("location");
  const contactCta = byKey("contact-cta");

  return (
    <>
      {/* When no banner is set, Header renders exactly as it always has:
          its own row, before main, normal sticky solid header — no
          structural change from the original page for this common case.
          Only when a banner IS set does Header move to float on top of
          the full-bleed hero image instead (see inside the hero section
          below), since only then is there a photo behind it to float on. */}
      {!hasBanner && <Header />}
      <main className="flex-1 pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lb) }} />

      {/* Hero. When a banner is set (hasBanner), the image/video is a
          full-bleed background filling this entire block (behind the
          header too), with the header and hero text/buttons overlaid on
          top in light colors with a text-shadow for readability over a
          photo — the standard hero-banner layout. With no banner set,
          this renders exactly as the original plain hero: normal-height
          section, dark text on the site's background tint — unchanged
          from before. */}
      <section
        className={
          hasBanner
            ? "relative isolate overflow-hidden min-h-[520px] sm:min-h-[600px] md:min-h-[680px] flex flex-col bg-primary/5"
            : "section bg-primary/5"
        }
      >
        {hasBanner && (
          <>
            <div className="absolute inset-0 -z-10">
              <HomeBanner background />
            </div>
            <Header overlay />
          </>
        )}

        <div className={hasBanner ? "relative flex-1 flex items-center" : undefined}>
          <div className={hasBanner ? "container-narrow py-10" : "container-narrow"}>
            <div className="text-center max-w-3xl mx-auto">
              <p
                className={
                  hasBanner
                    ? "text-sm font-medium text-white mb-2 sm:mb-3 tracking-wide uppercase [text-shadow:0_1px_4px_rgb(0_0_0_/_0.6)]"
                    : "text-sm font-medium text-primary mb-2 sm:mb-3 tracking-wide uppercase"
                }
              >
                Yoga Classes in Delhi NCR
              </p>
              <h1
                className={
                  hasBanner
                    ? "text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight [text-shadow:0_2px_8px_rgb(0_0_0_/_0.6)]"
                    : "text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground leading-tight"
                }
              >
                {hero?.heading || "Yoga Fit with Meenu"}
              </h1>
              <p
                className={
                  hasBanner
                    ? "mt-3 sm:mt-4 text-base sm:text-lg text-white/95 max-w-2xl mx-auto [text-shadow:0_1px_4px_rgb(0_0_0_/_0.6)]"
                    : "mt-3 sm:mt-4 text-base sm:text-lg text-muted max-w-2xl mx-auto"
                }
              >
                {hero?.description ||
                  "Improve movement, flexibility, strength, mindfulness and general wellbeing through yoga. Group, personal and online classes available."}
              </p>
              {/* Two CTAs only (no "Call" button here — a tap-to-call option
                  still exists via the bottom mobile CTA bar and the footer).
                  flex-col on mobile keeps both buttons full-width and evenly
                  stacked instead of the cramped two/three-button wrap that
                  used to appear here; sm:flex-row restores the side-by-side
                  layout once there's enough width for it to look balanced. */}
              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={whatsappUrl(SITE.whatsapp, freeClassMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full sm:w-auto text-center"
                >
                  {hero?.cta_text || "Book a Free Class"}
                </a>
                <Link
                  href="/services"
                  className={cn(
                    "w-full sm:w-auto text-center",
                    hasBanner ? "btn-secondary bg-white/95 hover:bg-white border-white/95" : "btn-secondary"
                  )}
                >
                  View Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      {isEnabled("benefits") && (
        <section className="section">
          <div className="container-narrow">
            <h2 className="text-2xl md:text-3xl text-center mb-10">{benefits?.heading || "Why Practice Yoga?"}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFIT_CARDS.map((item) => (
                <div key={item.title} className="rounded-card border border-border bg-white p-6 shadow-sm">
                  <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services preview */}
      {isEnabled("services") && services.length > 0 && (
        <section className="section bg-primary/5">
          <div className="container-narrow">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl">{servicesSection?.heading || "Our Services"}</h2>
              {servicesSection?.description && <p className="mt-2 text-muted">{servicesSection.description}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="rounded-card border border-border bg-white p-6 hover:border-primary/40 transition-colors"
                >
                  <h3 className="font-medium text-lg text-primary">{s.name}</h3>
                  {s.short_description && <p className="mt-2 text-sm text-muted">{s.short_description}</p>}
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href={servicesSection?.cta_url || "/services"} className="btn-secondary">
                {servicesSection?.cta_text || "All Services"}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Meenu */}
      {isEnabled("about") && (
        <section className="section">
          <div className="container-narrow max-w-3xl text-center">
            {about?.image_url && (
              <div className="relative h-48 w-48 mx-auto mb-6 rounded-full overflow-hidden bg-gray-100">
                <Image src={about.image_url} alt="Meenu" fill className="object-cover" sizes="192px" />
              </div>
            )}
            <h2 className="text-2xl md:text-3xl mb-4">{about?.heading || "Meet Meenu"}</h2>
            <p className="text-muted leading-relaxed">
              {about?.description ||
                "Meenu is a dedicated yoga teacher helping individuals in Delhi NCR improve movement, flexibility, strength and mindfulness through regular practice. Classes are offered in group, personal and online formats so you can choose what works best for you."}
            </p>
            <Link href={about?.cta_url || "/about"} className="btn-secondary mt-6 inline-flex">
              {about?.cta_text || "About Meenu"}
            </Link>
          </div>
        </section>
      )}

      {/* Packages preview */}
      {isEnabled("packages") && packages.length > 0 && (
        <section className="section bg-primary/5">
          <div className="container-narrow">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl">{packagesSection?.heading || "Classes & Packages"}</h2>
              {packagesSection?.description && <p className="mt-2 text-muted">{packagesSection.description}</p>}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-card border bg-white p-6 flex flex-col ${pkg.is_popular ? "border-primary shadow-md" : "border-border"}`}
                >
                  {!!pkg.is_popular && <span className="text-xs font-medium text-primary mb-2">Popular</span>}
                  <h3 className="text-lg font-medium">{pkg.name}</h3>
                  <p className="mt-1 text-xl font-semibold text-primary">{formatPrice(pkg.price, pkg.currency)}</p>
                  {pkg.description && <p className="mt-2 text-sm text-muted flex-1">{pkg.description}</p>}
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href={packagesSection?.cta_url || "/pricing"} className="btn-secondary">
                {packagesSection?.cta_text || "See Pricing"}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      {isEnabled("why-us") && (whyUs?.heading || whyUs?.description) && (
        <section className="section">
          <div className="container-narrow max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl mb-4">{whyUs?.heading || "Why Yoga Fit with Meenu"}</h2>
            {whyUs?.description && <p className="text-muted">{whyUs.description}</p>}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {isEnabled("testimonials") && testimonials.length > 0 && (
        <section className="section bg-primary/5">
          <div className="container-narrow">
            <h2 className="text-2xl md:text-3xl text-center mb-10">{testimonialsSection?.heading || "What Students Say"}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-card border border-border bg-white p-6 shadow-sm">
                  <p className="text-sm text-muted leading-relaxed">&ldquo;{t.review}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3">
                    {t.photo_url && (
                      // Plain <img>, not next/image: this app runs on
                      // Cloudflare Workers (@opennextjs/cloudflare), which
                      // doesn't support Next's built-in image optimizer —
                      // same reasoning as HomeBanner.tsx and the blog
                      // images above. Fixed circular size keeps this from
                      // affecting the card's existing layout/spacing.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.photo_url}
                        alt={t.name}
                        className="h-10 w-10 rounded-full object-cover shrink-0"
                      />
                    )}
                    <p className="text-sm font-medium">
                      {t.name}
                      {t.location && <span className="text-muted font-normal"> · {t.location}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {isEnabled("faq") && faqs.length > 0 && (
        <section className="section">
          <div className="container-narrow max-w-3xl">
            <h2 className="text-2xl md:text-3xl text-center mb-10">{faqSection?.heading || "Frequently Asked Questions"}</h2>
            <FaqAccordion faqs={faqs} />
            <div className="text-center mt-8">
              <Link href="/faq" className="btn-secondary">
                All FAQs
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Blog preview */}
      {isEnabled("blog") && posts.length > 0 && (
        <section className="section bg-primary/5">
          <div className="container-narrow">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl">{blogSection?.heading || "From the Blog"}</h2>
              {blogSection?.description && <p className="mt-2 text-muted">{blogSection.description}</p>}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="rounded-card border border-border bg-white p-6 hover:border-primary/40 transition-colors"
                >
                  <h3 className="font-medium text-lg text-primary">{post.title}</h3>
                  {post.excerpt && <p className="mt-2 text-sm text-muted">{post.excerpt}</p>}
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href={blogSection?.cta_url || "/blog"} className="btn-secondary">
                {blogSection?.cta_text || "Read Blog"}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      {isEnabled("location") && (
        <section className="section">
          <div className="container-narrow text-center max-w-2xl">
            <h2 className="text-2xl md:text-3xl mb-4">{location?.heading || "Serving Delhi NCR"}</h2>
            <p className="text-muted">
              {location?.description ||
                `Based at ${SITE.address.street}, ${SITE.address.city} ${SITE.address.postal}. Offline classes in the local area and online sessions for students across ${SITE.serviceArea} and beyond.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={`tel:${SITE.phone}`} className="btn-primary">
                Call Now
              </a>
              <a href={whatsappUrl(SITE.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {isEnabled("contact-cta") && (
        <section className="section bg-primary/5">
          <div className="container-narrow text-center rounded-card border border-border bg-white p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl md:text-3xl mb-3">{contactCta?.heading || "Ready to Start?"}</h2>
            <p className="text-muted mb-6">
              {contactCta?.description || "Book a free introductory class or get in touch with any questions."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={whatsappUrl(SITE.whatsapp, freeClassMsg)} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Free Class on WhatsApp
              </a>
              <Link href={contactCta?.cta_url || "/contact"} className="btn-secondary">
                {contactCta?.cta_text || "Contact Us"}
              </Link>
            </div>
          </div>
        </section>
      )}
      </main>
      <Footer />
      <MobileCTA freeClassMessage={freeClassMsg} />
    </>
  );
}
