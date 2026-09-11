import Link from "next/link";
import { SITE, whatsappUrl } from "@/lib/utils";
import { localBusinessJsonLd } from "@/lib/seo";
import { HomeBanner } from "@/components/HomeBanner";

// The banner is admin-managed and stored in D1, so the homepage is rendered
// per-request (via the Worker) rather than statically at build time. This
// keeps the banner up to date immediately after an admin uploads a new one,
// while Cloudflare's edge cache/CDN still keeps repeat views fast.
export const dynamic = "force-dynamic";

const freeClassMsg =
  "Hi Meenu, I would like to attend a free yoga class. Please share the details.";

export default function HomePage() {
  const lb = localBusinessJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lb) }}
      />

      {/* Hero */}
      <section className="section bg-primary/5">
        <div className="container-narrow text-center max-w-3xl mx-auto">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">
            Yoga Classes in Delhi NCR
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground leading-tight">
            Yoga Fit with Meenu
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Improve movement, flexibility, strength, mindfulness and general
            wellbeing through yoga. Group, personal and online classes available.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappUrl(SITE.whatsapp, freeClassMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Book a Free Class
            </a>
            <Link href="/services" className="btn-secondary">
              View Services
            </Link>
            <a href={`tel:${SITE.phone}`} className="btn-secondary">
              Call {SITE.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Banner (image or video, admin-managed) */}
      <section className="container-narrow -mt-6 relative z-10">
        <HomeBanner />
      </section>

      {/* Benefits */}
      <section className="section">
        <div className="container-narrow">
          <h2 className="text-2xl md:text-3xl text-center mb-10">
            Why Practice Yoga?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Movement & Flexibility",
                text: "Improve range of motion and ease of daily movement.",
              },
              {
                title: "Strength",
                text: "Build functional strength through mindful postures.",
              },
              {
                title: "Mindfulness",
                text: "Connect breath and body for greater awareness.",
              },
              {
                title: "Wellbeing",
                text: "Support overall physical and mental wellbeing.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-card border border-border bg-white p-6 shadow-sm"
              >
                <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="section bg-primary/5">
        <div className="container-narrow">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl">Our Services</h2>
            <p className="mt-2 text-muted">
              Classes designed for different needs and levels.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Group Yoga Classes",
                href: "/services/group-yoga-classes",
                desc: "Practice together in a supportive group setting.",
              },
              {
                title: "Personal / One-to-One",
                href: "/services/personal-yoga-classes",
                desc: "Individual attention tailored to your body and goals.",
              },
              {
                title: "Online Yoga Classes",
                href: "/services/online-yoga-classes",
                desc: "Live classes from the comfort of your home.",
              },
              {
                title: "Yoga for Beginners",
                href: "/services/yoga-for-beginners",
                desc: "Gentle introduction for complete beginners.",
              },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="rounded-card border border-border bg-white p-6 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-medium text-lg text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services" className="btn-secondary">
              All Services
            </Link>
          </div>
        </div>
      </section>

      {/* About Meenu */}
      <section className="section">
        <div className="container-narrow max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl mb-4">Meet Meenu</h2>
          <p className="text-muted leading-relaxed">
            Meenu is a dedicated yoga teacher helping individuals in Delhi NCR
            improve movement, flexibility, strength and mindfulness through
            regular practice. Classes are offered in group, personal and online
            formats so you can choose what works best for you.
          </p>
          <Link href="/about" className="btn-secondary mt-6 inline-flex">
            About Meenu
          </Link>
        </div>
      </section>

      {/* Location */}
      <section className="section bg-primary/5">
        <div className="container-narrow text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl mb-4">Serving Delhi NCR</h2>
          <p className="text-muted">
            Based at I-55, Gali No. 2, Jaitpur, Badarpur, New Delhi 110044.
            Offline classes in the local area and online sessions for students
            across Delhi NCR and beyond.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={`tel:${SITE.phone}`} className="btn-primary">
              Call Now
            </a>
            <a
              href={whatsappUrl(SITE.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-narrow text-center rounded-card border border-border bg-white p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl md:text-3xl mb-3">Ready to Start?</h2>
          <p className="text-muted mb-6">
            Book a free introductory class or get in touch with any questions.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={whatsappUrl(SITE.whatsapp, freeClassMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Free Class on WhatsApp
            </a>
            <Link href="/contact" className="btn-secondary">
              Contact Form
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
