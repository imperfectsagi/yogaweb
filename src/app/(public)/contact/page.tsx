import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE, whatsappUrl } from "@/lib/utils";
import { getPageBySlug, getAllSiteSettings } from "@/lib/cms";

export const metadata: Metadata = buildMetadata({
  title: "Contact | Yoga Fit with Meenu",
  description: "Contact Meenu for yoga classes in Delhi NCR. Call, WhatsApp or email.",
});

const FALLBACK_INTRO = "Reach out by phone, WhatsApp or email. For the fastest response, WhatsApp is preferred.";

export default async function ContactPage() {
  let intro = FALLBACK_INTRO;
  try {
    const page = await getPageBySlug("contact");
    if (page?.content) {
      const parsed = JSON.parse(page.content);
      intro = parsed.intro || FALLBACK_INTRO;
    }
  } catch {
    intro = FALLBACK_INTRO;
  }

  let businessHours = "";
  try {
    const settings = await getAllSiteSettings();
    businessHours = settings.business_hours || "";
  } catch {
    businessHours = "";
  }

  return (
    <div className="section">
      <div className="container-narrow max-w-2xl">
        <h1 className="text-3xl font-semibold mb-6">Contact</h1>
        <p className="text-muted mb-8">{intro}</p>
        <ul className="space-y-4 text-muted">
          <li>
            <strong className="text-foreground">Phone:</strong>{" "}
            <a href={`tel:${SITE.phone}`} className="text-primary">
              {SITE.phone}
            </a>
          </li>
          <li>
            <strong className="text-foreground">WhatsApp:</strong>{" "}
            <a href={whatsappUrl(SITE.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-primary">
              Chat on WhatsApp
            </a>
          </li>
          <li>
            <strong className="text-foreground">Email:</strong>{" "}
            <a href={`mailto:${SITE.email}`} className="text-primary">
              {SITE.email}
            </a>
          </li>
          <li>
            <strong className="text-foreground">Address:</strong> {SITE.address.street}, {SITE.address.city},{" "}
            {SITE.address.region} {SITE.address.postal}
          </li>
          <li>
            <strong className="text-foreground">Service area:</strong> {SITE.serviceArea}
          </li>
          {businessHours && (
            <li>
              <strong className="text-foreground">Business hours:</strong> {businessHours}
            </li>
          )}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`tel:${SITE.phone}`} className="btn-primary">
            Call Now
          </a>
          <a href={whatsappUrl(SITE.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
