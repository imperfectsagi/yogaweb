import type { Metadata } from "next";
import { buildMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FAQ | Yoga Fit with Meenu",
  description: "Frequently asked questions about yoga classes with Meenu in Delhi NCR.",
});

const faqs = [
  { question: "Do I need prior experience to join?", answer: "No. We welcome complete beginners. Classes include clear guidance and modifications so you can practice safely at your own pace." },
  { question: "Are classes available online?", answer: "Yes. Online live classes are available in addition to offline sessions in Delhi NCR." },
  { question: "What should I bring to class?", answer: "Comfortable clothing you can move in, a yoga mat (if you have one), and a water bottle. Please confirm mat availability when you book." },
  { question: "Where are offline classes held?", answer: "Offline classes are based in the Badarpur / Jaitpur area of New Delhi (I-55, Gali No. 2, Jaitpur, Badarpur). Service area covers Delhi NCR." },
];

export default function FaqPage() {
  const jsonLd = faqJsonLd(faqs);
  return (
    <div className="section">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <div className="container-narrow max-w-3xl">
        <h1 className="text-3xl font-semibold mb-8">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {faqs.map((f) => (
            <div key={f.question} className="border-b border-border pb-6">
              <h2 className="text-lg font-medium mb-2">{f.question}</h2>
              <p className="text-muted text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
