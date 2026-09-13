import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { SITE, whatsappUrl } from "@/lib/utils";
import { getServiceBySlug } from "@/lib/db";

type ServiceDetail = {
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  featured_image: string | null;
  who_it_is_for: string | null;
  duration: string | null;
  online_available: number;
  offline_available: number;
  price_starting_from: string | null;
  cta_text: string | null;
  cta_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let service: ServiceDetail | null = null;
  try {
    service = (await getServiceBySlug(slug)) as unknown as ServiceDetail | null;
  } catch {
    service = null;
  }
  if (!service) return {};
  return buildMetadata({
    title: service.seo_title || `${service.name} | Yoga Fit with Meenu`,
    description: service.seo_description || service.short_description,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  let service: ServiceDetail | null = null;
  try {
    service = (await getServiceBySlug(slug)) as unknown as ServiceDetail | null;
  } catch {
    service = null;
  }
  if (!service) notFound();

  const modes = [
    service.online_available ? "Online" : null,
    service.offline_available ? "Offline" : null,
  ].filter(Boolean);

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

        {service.featured_image && (
          <div className="relative h-56 sm:h-72 w-full mb-6 rounded-card overflow-hidden bg-gray-100">
            <Image src={service.featured_image} alt={service.name} fill className="object-cover" sizes="100vw" priority />
          </div>
        )}

        <h1 className="text-3xl font-semibold mb-4">{service.name}</h1>
        {service.short_description && <p className="text-lg text-muted mb-6">{service.short_description}</p>}
        {service.full_description && <p className="text-muted leading-relaxed mb-6 whitespace-pre-line">{service.full_description}</p>}

        {(modes.length > 0 || service.duration || service.price_starting_from) && (
          <div className="flex flex-wrap gap-4 text-sm text-muted mb-6 border-y border-border py-4">
            {modes.length > 0 && <span><strong className="text-foreground">Mode:</strong> {modes.join(" / ")}</span>}
            {service.duration && <span><strong className="text-foreground">Duration:</strong> {service.duration}</span>}
            {service.price_starting_from && <span><strong className="text-foreground">Pricing:</strong> {service.price_starting_from}</span>}
          </div>
        )}

        {service.who_it_is_for && (
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-2">Who it&apos;s for</h2>
            <p className="text-muted">{service.who_it_is_for}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <a
            href={
              service.cta_url ||
              whatsappUrl(SITE.whatsapp, `Hi Meenu, I am interested in ${service.name}. Please share details.`)
            }
            target={service.cta_url ? undefined : "_blank"}
            rel={service.cta_url ? undefined : "noopener noreferrer"}
            className="btn-primary"
          >
            {service.cta_text || "Enquire on WhatsApp"}
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
