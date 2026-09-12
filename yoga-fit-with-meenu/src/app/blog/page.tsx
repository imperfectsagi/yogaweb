import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/db";

export const metadata: Metadata = buildMetadata({
  title: "Blog | Yoga Fit with Meenu",
  description: "Tips and guidance for your yoga practice from Meenu.",
});

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time: number | null;
};

export default async function BlogPage() {
  let posts: Post[] = [];
  try {
    posts = (await getPublishedPosts(20)) as unknown as Post[];
  } catch {
    posts = [];
  }

  return (
    <div className="section">
      <div className="container-narrow max-w-3xl">
        <h1 className="text-3xl font-semibold mb-2">Blog</h1>
        <p className="text-muted mb-8">Articles and tips for your yoga journey.</p>

        {posts.length === 0 ? (
          <p className="text-muted">New articles are on the way. Please check back soon.</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article key={post.id} className="rounded-card border border-border bg-white overflow-hidden sm:flex">
                {post.featured_image && (
                  <div className="relative h-40 sm:h-auto sm:w-48 shrink-0 bg-gray-100">
                    <Image src={post.featured_image} alt={post.title} fill className="object-cover" sizes="192px" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-medium">
                    <Link href={`/blog/${post.slug}`} className="text-primary hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && <p className="mt-2 text-sm text-muted">{post.excerpt}</p>}
                  <p className="mt-2 text-xs text-muted">
                    {post.published_at && new Date(post.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                    {post.reading_time ? ` · ${post.reading_time} min read` : ""}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
