import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminGetPost, adminUpdatePost, adminDeletePost, type BlogPostInput } from "@/lib/cms";

const schema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens only."),
  excerpt: z.string().max(500).nullable().optional(),
  content: z.string().max(50000).nullable().optional(),
  featured_image: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  published: z.boolean(),
  reading_time: z.number().int().min(0).nullable().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const post = await adminGetPost(id);
  if (!post) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const existing = await adminGetPost(id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data." }, { status: 400 });
  }
  const data: BlogPostInput = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    excerpt: parsed.data.excerpt || null,
    content: parsed.data.content || null,
    featured_image: parsed.data.featured_image || null,
    category_id: parsed.data.category_id || null,
    published: parsed.data.published ? 1 : 0,
    reading_time: parsed.data.reading_time ?? null,
    seo_title: parsed.data.seo_title || null,
    seo_description: parsed.data.seo_description || null,
    canonical_url: existing.canonical_url,
    og_image: parsed.data.featured_image || existing.og_image,
    robots_index: existing.robots_index,
    robots_follow: existing.robots_follow,
  };
  await adminUpdatePost(id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  await adminDeletePost(id);
  return NextResponse.json({ ok: true });
}
