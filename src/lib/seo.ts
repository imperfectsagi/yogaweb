import { SITE } from "./utils";

export type PageSeo = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  ogImage?: string | null;
  noIndex?: boolean;
  noFollow?: boolean;
};

export function buildMetadata(page: PageSeo = {}) {
  const title =
    page.title ||
    "Yoga Classes in Delhi NCR | Yoga Fit with Meenu";
  const description =
    page.description ||
    "Improve movement, flexibility, strength, mindfulness and wellbeing through yoga with Meenu. Group, personal and online classes in Delhi NCR.";
  const canonical = page.canonical || SITE.url;
  const ogImage = page.ogImage || `${SITE.url}/og-default.jpg`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE.name,
      images: [{ url: ogImage }],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: !page.noIndex,
      follow: !page.noFollow,
    },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    description:
      "Yoga classes in Delhi NCR – group, personal and online sessions with Meenu.",
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postal,
      addressCountry: SITE.address.country,
    },
    areaServed: {
      "@type": "GeoCircle",
      // Do not invent coordinates – admin can add later
      name: SITE.serviceArea,
    },
    priceRange: "$$",
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phone,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
