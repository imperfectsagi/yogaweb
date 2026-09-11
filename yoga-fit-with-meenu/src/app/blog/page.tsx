import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog | Yoga Fit with Meenu",
  description: "Tips and guidance for your yoga practice from Meenu.",
});

export default function BlogPage() {
  return (
    <div className="section">
      <div className="container-narrow max-w-3xl">
        <h1 className="text-3xl font-semibold mb-2">Blog</h1>
        <p className="text-muted mb-8">Articles and tips for your yoga journey. Posts are managed from the admin CMS.</p>
        <article className="rounded-card border border-border bg-white p-6">
          <h2 className="text-xl font-medium">
            <Link href="/blog/getting-started-with-yoga-beginner" className="text-primary hover:underline">
              Getting Started with Yoga as a Beginner
            </Link>
          </h2>
          <p className="mt-2 text-sm text-muted">A simple guide to beginning your yoga journey with confidence and safety.</p>
        </article>
      </div>
    </div>
  );
}
