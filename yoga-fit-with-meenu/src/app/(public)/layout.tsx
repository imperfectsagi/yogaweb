import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileCTA } from "@/components/MobileCTA";

// This layout wraps ONLY the public, customer-facing routes (everything
// under the `(public)` route group — home, about, services, pricing, blog,
// contact, free-class, legal pages, etc). It does not wrap /admin, which
// has its own separate layout with no public header/footer/CTA — so the
// admin panel is never presented as part of the public website, and the
// public site never depends on any admin UI rendering.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileCTA />
    </>
  );
}
