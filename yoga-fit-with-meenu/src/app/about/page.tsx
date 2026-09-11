import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { SITE, whatsappUrl } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "About Meenu | Yoga Fit with Meenu",
  description: "Meet Meenu, yoga teacher offering group, personal and online yoga classes in Delhi NCR.",
});

export default function AboutPage() {
  return (
    <div className="section">
      <div className="container-narrow max-w-3xl">
        <h1 className="text-3xl font-semibold mb-6">About Meenu</h1>
        <div className="space-y-4 text-muted">
          <p>Yoga Fit with Meenu is dedicated to helping individuals improve movement, flexibility, strength, mindfulness and general wellbeing through yoga.</p>
          <p>Meenu teaches group classes, personal one-to-one sessions, and online classes for students in Delhi NCR and beyond. Classes are suitable for beginners as well as those with prior experience.</p>
          <p>The teaching approach focuses on clear guidance, safe alignment and a calm, supportive environment so you can build a sustainable practice.</p>
          <p><strong>Location:</strong> I-55, Gali No. 2, Jaitpur, Badarpur, New Delhi, Delhi 110044, India. Service area: Delhi NCR.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={whatsappUrl(SITE.whatsapp, "Hi Meenu, I would like to know more about your yoga classes.")} target="_blank" rel="noopener noreferrer" className="btn-primary">Message on WhatsApp</a>
          <Link href="/free-class" className="btn-secondary">Free Class</Link>
          <Link href="/contact" className="btn-secondary">Contact</Link>
        </div>
      </div>
    </div>
  );
}
