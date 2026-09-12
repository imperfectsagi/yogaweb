import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  adminGetService,
  adminUpdateService,
  adminDeleteService,
  adminGetServiceBySlugExcludingId,
  type ServiceInput,
} from "@/lib/cms";

const schema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens only."),
  short_description: z.string().max(500).nullable().optional(),
  full_description: z.string().max(5000).nullable().optional(),
  featured_image: z.string().nullable().optional(),
  benefits: z.array(z.string()).optional(),
  who_it_is_for: z.string().max(1000).nullable().optional(),
  duration: z.string().max(100).nullable().optional(),
  online_available: z.boolean(),
  offline_available: z.boolean(),
  service_area: z.string().max(200).nullable().optional(),
  price_starting_from: z.string().max(100).nullable().optional(),
  cta_text: z.string().max(50).nullable().optional(),
  cta_url: z.string().max(300).nullable().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
  published: z.boolean(),
  sort_order: z.number().int().default(0),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const service = await adminGetService(id);
  if (!service) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ service });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;

  const existing = await adminGetService(id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data." }, { status: 400 });
  }

  const slugConflict = await adminGetServiceBySlugExcludingId(parsed.data.slug, id);
  if (slugConflict) {
    return NextResponse.json({ error: "A service with this slug already exists." }, { status: 409 });
  }

  const data: ServiceInput = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    short_description: parsed.data.short_description || null,
    full_description: parsed.data.full_description || null,
    featured_image: parsed.data.featured_image || null,
    gallery_json: existing.gallery_json,
    benefits_json: parsed.data.benefits?.length ? JSON.stringify(parsed.data.benefits) : null,
    who_it_is_for: parsed.data.who_it_is_for || null,
    duration: parsed.data.duration || null,
    online_available: parsed.data.online_available ? 1 : 0,
    offline_available: parsed.data.offline_available ? 1 : 0,
    service_area: parsed.data.service_area || null,
    price_starting_from: parsed.data.price_starting_from || null,
    cta_text: parsed.data.cta_text || "Book a Class",
    cta_url: parsed.data.cta_url || null,
    faqs_json: existing.faqs_json,
    seo_title: parsed.data.seo_title || null,
    seo_description: parsed.data.seo_description || null,
    canonical_url: existing.canonical_url,
    og_image: parsed.data.featured_image || existing.og_image,
    robots_index: existing.robots_index,
    robots_follow: existing.robots_follow,
    published: parsed.data.published ? 1 : 0,
    sort_order: parsed.data.sort_order,
  };

  await adminUpdateService(id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  await adminDeleteService(id);
  return NextResponse.json({ ok: true });
}
