import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE, whatsappUrl } from "@/lib/utils";
import { getPageBySlug, getDefaultWhatsappMessage } from "@/lib/cms";

export const metadata: Metadata = buildMetadata({
  title: "Free Yoga Class | Yoga Fit with Meenu",
  description: "Book a free introductory yoga class with Meenu in Delhi NCR or online.",
});

const FALLBACK_INTRO = "Experience a class with Meenu at no cost. Message on WhatsApp — no long form required.";

export default async function FreeClassPage() {
  let intro = FALLBACK_INTRO;
  try {
    const page = await getPageBySlug("free-class");
    if (page?.content) {
      const parsed = JSON.parse(page.content);
      intro = parsed.intro || FALLBACK_INTRO;
    }
  } catch {
    intro = FALLBACK_INTRO;
  }

  const msg = await getDefaultWhatsappMessage();

  return (
    <div className="section">
      <div className="container-narrow max-w-xl text-center">
        <h1 className="text-3xl font-semibold mb-4">Book a Free Class</h1>
        <p className="text-muted mb-8">{intro}</p>
        <a href={whatsappUrl(SITE.whatsapp, msg)} target="_blank" rel="noopener noreferrer" className="btn-primary text-base px-8 py-3">
          Message on WhatsApp
        </a>
        <p className="mt-6 text-sm text-muted">
          Or call{" "}
          <a href={`tel:${SITE.phone}`} className="text-primary underline">
            {SITE.phone}
          </a>
        </p>
      </div>
    </div>
  );
}
