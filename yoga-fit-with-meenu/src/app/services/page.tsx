import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Yoga Services | Yoga Fit with Meenu",
  description: "Group yoga, personal sessions, online classes and yoga for beginners in Delhi NCR.",
});

const services = [
  { slug: "group-yoga-classes", name: "Group Yoga Classes", desc: "Practice together in a supportive group setting." },
  { slug: "personal-yoga-classes", name: "Personal / One-to-One Yoga Classes", desc: "Individual attention tailored to your body and goals." },
  { slug: "online-yoga-classes", name: "Online Yoga Classes", desc: "Live online classes so you can practice from home." },
  { slug: "yoga-for-beginners", name: "Yoga for Beginners", desc: "Gentle introduction for complete beginners." },
];

export default function ServicesPage() {
  return (
    <div className="section">
      <div className="container-narrow">
        <h1 className="text-3xl font-semibold mb-2">Services</h1>
        <p className="text-muted mb-10 max-w-2xl">Yoga classes designed to improve movement, flexibility, strength and mindfulness.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {services.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="rounded-card border border-border bg-white p-6 hover:border-primary/40 transition-colors block">
              <h2 className="text-xl font-medium text-primary">{s.name}</h2>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
              <span className="mt-4 inline-block text-sm font-medium text-primary">Learn more →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
