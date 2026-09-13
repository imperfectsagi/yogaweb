import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  adminListServices,
  adminCreateService,
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

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const services = await adminListServices();
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data." }, { status: 400 });
  }

  const existing = await adminGetServiceBySlugExcludingId(parsed.data.slug);
  if (existing) {
    return NextResponse.json({ error: "A service with this slug already exists." }, { status: 409 });
  }

  const data: ServiceInput = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    short_description: parsed.data.short_description || null,
    full_description: parsed.data.full_description || null,
    featured_image: parsed.data.featured_image || null,
    gallery_json: null,
    benefits_json: parsed.data.benefits?.length ? JSON.stringify(parsed.data.benefits) : null,
    who_it_is_for: parsed.data.who_it_is_for || null,
    duration: parsed.data.duration || null,
    online_available: parsed.data.online_available ? 1 : 0,
    offline_available: parsed.data.offline_available ? 1 : 0,
    service_area: parsed.data.service_area || null,
    price_starting_from: parsed.data.price_starting_from || null,
    cta_text: parsed.data.cta_text || "Book a Class",
    cta_url: parsed.data.cta_url || null,
    faqs_json: null,
    seo_title: parsed.data.seo_title || null,
    seo_description: parsed.data.seo_description || null,
    canonical_url: null,
    og_image: parsed.data.featured_image || null,
    robots_index: 1,
    robots_follow: 1,
    published: parsed.data.published ? 1 : 0,
    sort_order: parsed.data.sort_order,
  };

  const id = await adminCreateService(data);
  return NextResponse.json({ ok: true, id });
}
