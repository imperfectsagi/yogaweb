import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getPostBySlug } from "@/lib/db";

type Post = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let post: Post | null = null;
  try {
    post = (await getPostBySlug(slug)) as unknown as Post | null;
  } catch {
    post = null;
  }
  if (!post) return {};
  return buildMetadata({
    title: post.seo_title || `${post.title} | Yoga Fit with Meenu`,
    description: post.seo_description || post.excerpt,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post: Post | null = null;
  try {
    post = (await getPostBySlug(slug)) as unknown as Post | null;
  } catch {
    post = null;
  }
  if (!post) notFound();

  return (
    <div className="section">
      <div className="container-narrow max-w-3xl">
        <nav className="text-sm text-muted mb-6">
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span>{post.title}</span>
        </nav>

        {post.featured_image && (
          <div className="relative h-56 sm:h-72 w-full mb-6 rounded-card overflow-hidden bg-gray-100">
            {/* unoptimized: see the same fix + explanation in blog/page.tsx
                and HomeBanner.tsx — Next's built-in image optimizer isn't
                available on this app's Cloudflare Workers runtime. */}
            <Image src={post.featured_image} alt={post.title} fill className="object-cover" sizes="100vw" priority unoptimized />
          </div>
        )}

        <h1 className="text-3xl font-semibold mb-2">{post.title}</h1>
        <p className="text-xs text-muted mb-6">
          {post.published_at && new Date(post.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          {post.reading_time ? ` · ${post.reading_time} min read` : ""}
        </p>

        {post.content && (
          // Content is authored by the site admin only (not user-generated),
          // consistent with how the rest of the CMS trusts admin-entered
          // HTML (e.g. no sanitizer elsewhere in this codebase either).
          <div
            className="text-muted space-y-4 max-w-none leading-relaxed [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        <Link href="/free-class" className="btn-primary mt-8 inline-flex">
          Book a Free Class
        </Link>
      </div>
    </div>
  );
}
