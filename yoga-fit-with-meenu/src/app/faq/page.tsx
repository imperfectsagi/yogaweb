import type { Metadata } from "next";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { getFaqs } from "@/lib/db";

export const metadata: Metadata = buildMetadata({
  title: "FAQ | Yoga Fit with Meenu",
  description: "Frequently asked questions about yoga classes with Meenu in Delhi NCR.",
});

type Faq = { id: string; question: string; answer: string };

export default async function FaqPage() {
  let faqs: Faq[] = [];
  try {
    faqs = (await getFaqs(false)) as unknown as Faq[];
  } catch {
    faqs = [];
  }

  const jsonLd = faqJsonLd(faqs);

  return (
    <div className="section">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <div className="container-narrow max-w-3xl">
        <h1 className="text-3xl font-semibold mb-8">Frequently Asked Questions</h1>
        {faqs.length === 0 ? (
          <p className="text-muted">Have a question? Reach out via the contact page and we'll be happy to help.</p>
        ) : (
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.id} className="border-b border-border pb-6">
                <h2 className="text-lg font-medium mb-2">{f.question}</h2>
                <p className="text-muted text-sm leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
