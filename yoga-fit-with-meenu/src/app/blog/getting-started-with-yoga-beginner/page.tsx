import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Getting Started with Yoga as a Beginner | Yoga Fit with Meenu",
  description: "Practical tips for complete beginners who want to start yoga safely.",
});

export default function BlogPostPage() {
  return (
    <div className="section">
      <div className="container-narrow max-w-3xl">
        <nav className="text-sm text-muted mb-6">
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <span className="mx-2">/</span>
          <span>Getting Started with Yoga</span>
        </nav>
        <h1 className="text-3xl font-semibold mb-4">Getting Started with Yoga as a Beginner</h1>
        <div className="prose text-muted space-y-4">
          <p>Starting yoga can feel exciting and a little uncertain. The good news is you do not need to be flexible or strong to begin.</p>
          <p>Focus on showing up consistently, listening to your body, and following clear guidance from a teacher. Breath awareness and basic standing and seated postures form a solid foundation.</p>
          <p>If you are in Delhi NCR, group or personal classes with Meenu can help you start safely.</p>
        </div>
        <Link href="/free-class" className="btn-primary mt-8 inline-flex">Book a Free Class</Link>
      </div>
    </div>
  );
}
