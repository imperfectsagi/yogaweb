import Link from "next/link";
import { SITE } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary/5 mt-auto">
      <div className="container-narrow py-12 grid gap-8 md:grid-cols-3">
        <div>
          <p className="font-semibold text-primary text-lg">{SITE.name}</p>
          <p className="mt-2 text-sm text-muted">
            Yoga Classes in Delhi NCR. Improve movement, flexibility, strength,
            mindfulness and wellbeing.
          </p>
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
              {SITE.address.street}, {SITE.address.city}, {SITE.address.region}{" "}
              {SITE.address.postal}
            </li>
          </ul>
        </div>

        <div>
          <p className="font-medium mb-3">Explore</p>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/services" className="hover:text-foreground">
                Services
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="hover:text-foreground">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
