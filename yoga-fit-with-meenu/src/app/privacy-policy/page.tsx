import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | Yoga Fit with Meenu",
  noIndex: false,
});

export default function PrivacyPage() {
  return (
    <div className="section">
      <div className="container-narrow max-w-3xl prose text-muted">
        <h1 className="text-3xl font-semibold text-foreground mb-6">Privacy Policy</h1>
        <p>Last updated: September 2026</p>
        <p>{SITE.name} (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy describes how we handle information when you use our website {SITE.url}.</p>
        <h2 className="text-xl font-medium text-foreground mt-8 mb-2">Information we collect</h2>
        <p>When you contact us via forms, WhatsApp, phone or email, we may collect your name, phone number, email address and any message you send so we can respond to your enquiry.</p>
        <h2 className="text-xl font-medium text-foreground mt-8 mb-2">How we use information</h2>
        <p>We use contact details only to respond to enquiries, schedule classes and improve our services. We do not sell personal data.</p>
        <h2 className="text-xl font-medium text-foreground mt-8 mb-2">Contact</h2>
        <p>For privacy questions, email {SITE.email} or call {SITE.phone}.</p>
      </div>
    </div>
  );
}
