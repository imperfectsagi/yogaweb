import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE, whatsappUrl } from "@/lib/utils";
import { getActivePackages, getApprovedReviewsByPackage, type PublicPackageReview } from "@/lib/db";
import { PackageReviews } from "@/components/PackageReviews";
import { StarRating } from "@/components/StarRating";

export const metadata: Metadata = buildMetadata({
  title: "Pricing & Packages | Yoga Fit with Meenu",
  description: "Flexible yoga class packages in Delhi NCR. Contact for current pricing.",
});

type Package = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  features_json: string | null;
  is_popular: number;
  cta_text: string | null;
  cta_url: string | null;
};

function formatPrice(price: number, currency: string): string {
  if (price === 0) return "Free";
  const symbol = currency === "INR" ? "₹" : currency + " ";
  return `${symbol}${price.toLocaleString("en-IN")}`;
}

export default async function PricingPage() {
  let packages: Package[] = [];
  try {
    packages = (await getActivePackages()) as unknown as Package[];
  } catch {
    packages = [];
  }

  let reviewsByPackage: Record<string, PublicPackageReview[]> = {};
  try {
    reviewsByPackage = await getApprovedReviewsByPackage();
  } catch {
    reviewsByPackage = {};
  }

  return (
    <div className="section">
      <div className="container-narrow">
        <h1 className="text-3xl font-semibold mb-2">Pricing & Packages</h1>
        <p className="text-muted mb-10 max-w-2xl">Contact for the latest rates and current offers.</p>

        {packages.length === 0 ? (
          <p className="text-muted">Pricing details will be available here soon. Please contact us directly for current rates.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {packages.map((pkg) => {
              const features: string[] = pkg.features_json ? JSON.parse(pkg.features_json) : [];
              const reviews = reviewsByPackage[pkg.id] || [];
              const average =
                reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
              return (
                <div
                  key={pkg.id}
                  className={`rounded-card border bg-white p-6 flex flex-col self-start ${pkg.is_popular ? "border-primary shadow-md" : "border-border"}`}
                >
                  {!!pkg.is_popular && <span className="text-xs font-medium text-primary mb-2">Popular</span>}
                  <h2 className="text-xl font-medium">{pkg.name}</h2>
                  {reviews.length > 0 && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <StarRating rating={average} size={3} />
                      <span className="text-xs text-muted">
                        {average.toFixed(1)} ({reviews.length})
                      </span>
                    </div>
                  )}
                  <p className="mt-2 text-2xl font-semibold text-primary">
                    {formatPrice(pkg.price, pkg.currency)}
                    {pkg.original_price && pkg.original_price > pkg.price && (
                      <span className="ml-2 text-sm font-normal text-muted line-through">
                        {formatPrice(pkg.original_price, pkg.currency)}
                      </span>
                    )}
                  </p>
                  {pkg.description && <p className="mt-2 text-sm text-muted flex-1">{pkg.description}</p>}
                  {features.length > 0 && (
                    <ul className="mt-4 space-y-1 text-sm text-muted">
                      {features.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                  )}
                  <a
                    href={pkg.cta_url || whatsappUrl(SITE.whatsapp, `Hi Meenu, I am interested in the ${pkg.name} package.`)}
                    target={pkg.cta_url ? undefined : "_blank"}
                    rel={pkg.cta_url ? undefined : "noopener noreferrer"}
                    className="btn-primary mt-6 w-full text-center"
                  >
                    {pkg.cta_text || "Enquire"}
                  </a>

                  <PackageReviews packageId={pkg.id} packageName={pkg.name} reviews={reviews} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
