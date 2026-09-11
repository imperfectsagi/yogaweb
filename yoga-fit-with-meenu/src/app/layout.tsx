import type { Metadata, Viewport } from "next";
import "./globals.css";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileCTA } from "@/components/MobileCTA";

export const metadata: Metadata = {
  ...buildMetadata(),
  metadataBase: new URL(SITE.url),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2d5a4a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const org = organizationJsonLd();
  const website = websiteJsonLd();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileCTA />
      </body>
    </html>
  );
}
