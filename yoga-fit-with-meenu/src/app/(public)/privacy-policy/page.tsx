import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/utils";
import { getPageBySlug } from "@/lib/cms";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | Yoga Fit with Meenu",
  noIndex: false,
});

const FALLBACK_BODY = `${SITE.name} ("we", "us") respects your privacy. This policy describes how we handle information when you use our website ${SITE.url}.

## Information we collect
When you contact us via forms, WhatsApp, phone or email, we may collect your name, phone number, email address and any message you send so we can respond to your enquiry.

## How we use information
We use contact details only to respond to enquiries, schedule classes and improve our services. We do not sell personal data.

## Contact
For privacy questions, email ${SITE.email} or call ${SITE.phone}.`;

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

export default async function PrivacyPage() {
  let body = FALLBACK_BODY;
  try {
    const page = await getPageBySlug("privacy-policy");
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
        <h1 className="text-3xl font-semibold text-foreground mb-6">Privacy Policy</h1>
        <p>Last updated: September 2026</p>
        {renderBody(body)}
      </div>
    </div>
  );
}
