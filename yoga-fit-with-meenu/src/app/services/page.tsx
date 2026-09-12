import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";
import { getPublishedServices } from "@/lib/db";

export const metadata: Metadata = buildMetadata({
  title: "Yoga Services | Yoga Fit with Meenu",
  description: "Group yoga, personal sessions, online classes and yoga for beginners in Delhi NCR.",
});

type Service = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  featured_image: string | null;
};

export default async function ServicesPage() {
  let services: Service[] = [];
  try {
    services = (await getPublishedServices()) as unknown as Service[];
  } catch {
    services = [];
  }

  return (
    <div className="section">
      <div className="container-narrow">
        <h1 className="text-3xl font-semibold mb-2">Services</h1>
        <p className="text-muted mb-10 max-w-2xl">Yoga classes designed to improve movement, flexibility, strength and mindfulness.</p>

        {services.length === 0 ? (
          <p className="text-muted">Services will be listed here soon. Please check back shortly.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="rounded-card border border-border bg-white overflow-hidden hover:border-primary/40 transition-colors block"
              >
                {s.featured_image && (
                  <div className="relative h-40 w-full bg-gray-100">
                    <Image src={s.featured_image} alt={s.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-medium text-primary">{s.name}</h2>
                  {s.short_description && <p className="mt-2 text-sm text-muted">{s.short_description}</p>}
                  <span className="mt-4 inline-block text-sm font-medium text-primary">Learn more →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
