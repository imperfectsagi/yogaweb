import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/utils";
import { getPageBySlug } from "@/lib/cms";

export const metadata: Metadata = buildMetadata({
  title: "Terms and Conditions | Yoga Fit with Meenu",
});

const FALLBACK_BODY = `By using the website ${SITE.url} and enquiring about or attending classes with ${SITE.name}, you agree to these terms.

## Classes
Class timings, locations and fees are confirmed at the time of booking. We recommend consulting a doctor before starting any new physical activity if you have health concerns.

## No medical claims
Yoga is offered for general wellbeing, movement and mindfulness. We do not claim to cure, treat or diagnose medical conditions.

## Contact
${SITE.email} · ${SITE.phone}`;

function renderBody(body: string) {
  return body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-medium text-foreground mt-8 mb-2">
            {block.slice(3)}
          </h2>
        );
      }
      return <p key={i}>{block}</p>;
    });
}

export default async function TermsPage() {
  let body = FALLBACK_BODY;
  try {
    const page = await getPageBySlug("terms-and-conditions");
    if (page?.content) {
      const parsed = JSON.parse(page.content);
      body = parsed.body || FALLBACK_BODY;
    }
  } catch {
    body = FALLBACK_BODY;
  }

  return (
    <div className="section">
      <div className="container-narrow max-w-3xl text-muted space-y-4 leading-relaxed">
        <h1 className="text-3xl font-semibold text-foreground mb-6">Terms and Conditions</h1>
        <p>Last updated: September 2026</p>
        {renderBody(body)}
      </div>
    </div>
  );
}
