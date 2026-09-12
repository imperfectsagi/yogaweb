import Link from "next/link";
import { SITE } from "@/lib/utils";
import { getActiveNavigation, getAllSiteSettings } from "@/lib/cms";

const FALLBACK_FOOTER = [
  { id: "f-services", href: "/services", label: "Services" },
  { id: "f-pricing", href: "/pricing", label: "Pricing" },
  { id: "f-blog", href: "/blog", label: "Blog" },
  { id: "f-faq", href: "/faq", label: "FAQ" },
  { id: "f-privacy", href: "/privacy-policy", label: "Privacy Policy" },
  { id: "f-terms", href: "/terms-and-conditions", label: "Terms" },
];

export async function Footer() {
  let footerLinks: { id: string; href: string; label: string; is_external?: number }[] = FALLBACK_FOOTER;
  let socials: { instagram?: string; facebook?: string; youtube?: string } = {};

  try {
    const items = await getActiveNavigation("footer");
    if (items.length) {
      footerLinks = items.map((i) => ({ id: i.id, href: i.url, label: i.label, is_external: i.is_external }));
    }
  } catch {
    footerLinks = FALLBACK_FOOTER;
  }

  try {
    const settings = await getAllSiteSettings();
    socials = {
      instagram: settings.social_instagram || undefined,
      facebook: settings.social_facebook || undefined,
      youtube: settings.social_youtube || undefined,
    };
  } catch {
    socials = {};
  }

  const hasSocials = socials.instagram || socials.facebook || socials.youtube;

  return (
    <footer className="border-t border-border bg-primary/5 mt-auto">
      <div className="container-narrow py-12 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-semibold text-primary text-lg">{SITE.name}</p>
          <p className="mt-2 text-sm text-muted">
            Yoga Classes in Delhi NCR. Improve movement, flexibility, strength, mindfulness and wellbeing.
          </p>
          {hasSocials && (
            <div className="mt-4 flex gap-3 text-sm">
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary">
                  Instagram
                </a>
              )}
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary">
                  Facebook
                </a>
              )}
              {socials.youtube && (
                <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary">
                  YouTube
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="font-medium mb-3">Contact</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <a href={`tel:${SITE.phone}`} className="hover:text-foreground">
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
                {SITE.email}
              </a>
            </li>
            <li>
              {SITE.address.street}, {SITE.address.city}, {SITE.address.region} {SITE.address.postal}
            </li>
          </ul>
        </div>

        <div>
          <p className="font-medium mb-3">Explore</p>
          <ul className="space-y-2 text-sm text-muted">
            {footerLinks.map((link) => (
              <li key={link.id}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
