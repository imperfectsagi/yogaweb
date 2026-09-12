import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminGetPageBySlug, adminUpdatePage } from "@/lib/cms";

const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.record(z.string()), // flexible key/value content blocks per page (Zod v3: single-arg record, string keys implied)
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
  published: z.boolean(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { slug } = await params;
  const page = await adminGetPageBySlug(slug);
  if (!page) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data." }, { status: 400 });
  }
  await adminUpdatePage(slug, {
    title: parsed.data.title,
    content: JSON.stringify(parsed.data.content),
    seo_title: parsed.data.seo_title || null,
    seo_description: parsed.data.seo_description || null,
    published: parsed.data.published ? 1 : 0,
  });
  return NextResponse.json({ ok: true });
}
