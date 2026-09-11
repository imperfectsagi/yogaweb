import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { SITE, whatsappUrl } from "@/lib/utils";

const SERVICES: Record<
  string,
  { name: string; short: string; full: string }
> = {
  "group-yoga-classes": {
    name: "Group Yoga Classes",
    short: "Practice together in a supportive group setting.",
    full: "Group yoga classes focused on alignment, breath and mindful movement. Suitable for beginners and intermediate practitioners. Available offline in Delhi NCR and online.",
  },
  "personal-yoga-classes": {
    name: "Personal / One-to-One Yoga Classes",
    short: "Individual attention tailored to your body and goals.",
    full: "One-to-one sessions allow focused guidance on posture, flexibility, strength and any specific needs. Available offline and online.",
  },
  "online-yoga-classes": {
    name: "Online Yoga Classes",
    short: "Practice from the comfort of your home.",
    full: "Live online yoga classes with clear instruction and modifications. Join from anywhere.",
  },
  "yoga-for-beginners": {
    name: "Yoga for Beginners",
    short: "Gentle introduction for complete beginners.",
    full: "A supportive start focusing on basic postures, breathing and body awareness. No prior experience required.",
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES[slug];
  if (!service) return {};
  return buildMetadata({
    title: `${service.name} | Yoga Fit with Meenu`,
    description: service.short,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES[slug];
  if (!service) notFound();

  return (
    <div className="section">
      <div className="container-narrow max-w-3xl">
        <nav className="text-sm text-muted mb-6">
          <Link href="/services" className="hover:text-foreground">
            Services
          </Link>
          <span className="mx-2">/</span>
          <span>{service.name}</span>
        </nav>
        <h1 className="text-3xl font-semibold mb-4">{service.name}</h1>
        <p className="text-lg text-muted mb-6">{service.short}</p>
        <p className="text-muted leading-relaxed mb-8">{service.full}</p>
        <div className="flex flex-wrap gap-3">
          <a
            href={whatsappUrl(
              SITE.whatsapp,
              `Hi Meenu, I am interested in ${service.name}. Please share details.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Enquire on WhatsApp
          </a>
          <Link href="/pricing" className="btn-secondary">
            View Pricing
          </Link>
          <Link href="/free-class" className="btn-secondary">
            Free Class
          </Link>
        </div>
      </div>
    </div>
  );
}
