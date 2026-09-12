import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { SITE, whatsappUrl } from "@/lib/utils";
import { getPageBySlug } from "@/lib/cms";

export const metadata: Metadata = buildMetadata({
  title: "About Meenu | Yoga Fit with Meenu",
  description: "Meet Meenu, yoga teacher offering group, personal and online yoga classes in Delhi NCR.",
});

const FALLBACK = {
  intro:
    "Yoga Fit with Meenu is dedicated to helping individuals improve movement, flexibility, strength, mindfulness and general wellbeing through yoga.",
  body: "Meenu teaches group classes, personal one-to-one sessions, and online classes for students in Delhi NCR and beyond. Classes are suitable for beginners as well as those with prior experience.\n\nThe teaching approach focuses on clear guidance, safe alignment and a calm, supportive environment so you can build a sustainable practice.",
};

function renderParagraphs(text: string) {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => <p key={i}>{p}</p>);
}

export default async function AboutPage() {
  let content = FALLBACK;
  try {
    const page = await getPageBySlug("about");
    if (page?.content) {
      const parsed = JSON.parse(page.content);
      content = { intro: parsed.intro || FALLBACK.intro, body: parsed.body || FALLBACK.body };
    }
  } catch {
    content = FALLBACK;
  }

  return (
    <div className="section">
      <div className="container-narrow max-w-3xl">
        <h1 className="text-3xl font-semibold mb-6">About Meenu</h1>
        <div className="space-y-4 text-muted">
          <p>{content.intro}</p>
          {renderParagraphs(content.body)}
          <p>
            <strong>Location:</strong> {SITE.address.street}, {SITE.address.city}, {SITE.address.region}{" "}
            {SITE.address.postal}, India. Service area: {SITE.serviceArea}.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={whatsappUrl(SITE.whatsapp, "Hi Meenu, I would like to know more about your yoga classes.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Message on WhatsApp
          </a>
          <Link href="/free-class" className="btn-secondary">
            Free Class
          </Link>
          <Link href="/contact" className="btn-secondary">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
