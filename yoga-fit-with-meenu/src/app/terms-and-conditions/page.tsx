import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Terms and Conditions | Yoga Fit with Meenu",
});

export default function TermsPage() {
  return (
    <div className="section">
      <div className="container-narrow max-w-3xl prose text-muted">
        <h1 className="text-3xl font-semibold text-foreground mb-6">Terms and Conditions</h1>
        <p>Last updated: September 2026</p>
        <p>By using the website {SITE.url} and enquiring about or attending classes with {SITE.name}, you agree to these terms.</p>
        <h2 className="text-xl font-medium text-foreground mt-8 mb-2">Classes</h2>
        <p>Class timings, locations and fees are confirmed at the time of booking. We recommend consulting a doctor before starting any new physical activity if you have health concerns.</p>
        <h2 className="text-xl font-medium text-foreground mt-8 mb-2">No medical claims</h2>
        <p>Yoga is offered for general wellbeing, movement and mindfulness. We do not claim to cure, treat or diagnose medical conditions.</p>
        <h2 className="text-xl font-medium text-foreground mt-8 mb-2">Contact</h2>
        <p>{SITE.email} · {SITE.phone}</p>
      </div>
    </div>
  );
}
