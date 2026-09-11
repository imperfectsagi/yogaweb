import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE, whatsappUrl } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Pricing & Packages | Yoga Fit with Meenu",
  description: "Flexible yoga class packages in Delhi NCR. Contact for current pricing.",
});

const packages = [
  { name: "Trial / Free Class", desc: "Introductory session to experience the teaching style.", features: ["One session", "All levels", "Online or Offline"], popular: false },
  { name: "Monthly Group Classes", desc: "Regular group practice with consistent guidance.", features: ["Multiple group classes", "Flexible timing", "Beginner friendly"], popular: true },
  { name: "Personal Sessions Pack", desc: "Focused one-to-one attention.", features: ["Several personal sessions", "Custom plan", "Online or Offline"], popular: false },
];

export default function PricingPage() {
  return (
    <div className="section">
      <div className="container-narrow">
        <h1 className="text-3xl font-semibold mb-2">Pricing & Packages</h1>
        <p className="text-muted mb-10 max-w-2xl">Contact for latest rates. Packages below are examples; live data comes from the admin CMS.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.name} className={`rounded-card border bg-white p-6 flex flex-col ${pkg.popular ? "border-primary shadow-md" : "border-border"}`}>
              {pkg.popular && <span className="text-xs font-medium text-primary mb-2">Popular</span>}
              <h2 className="text-xl font-medium">{pkg.name}</h2>
              <p className="mt-2 text-sm text-muted flex-1">{pkg.desc}</p>
              <ul className="mt-4 space-y-1 text-sm text-muted">{pkg.features.map((f) => <li key={f}>• {f}</li>)}</ul>
              <a href={whatsappUrl(SITE.whatsapp, `Hi Meenu, I am interested in the ${pkg.name} package.`)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 w-full text-center">Enquire</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
