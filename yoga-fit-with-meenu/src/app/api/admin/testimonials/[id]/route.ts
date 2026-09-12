import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminGetTestimonial, adminUpdateTestimonial, adminDeleteTestimonial, type TestimonialInput } from "@/lib/cms";

const schema = z.object({
  name: z.string().min(1).max(200),
  review: z.string().min(1).max(2000),
  photo_url: z.string().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  service_id: z.string().nullable().optional(),
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
  const testimonial = await adminGetTestimonial(id);
  if (!testimonial) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ testimonial });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const existing = await adminGetTestimonial(id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data." }, { status: 400 });
  }
  const data: TestimonialInput = {
    name: parsed.data.name,
    review: parsed.data.review,
    photo_url: parsed.data.photo_url || null,
    location: parsed.data.location || null,
    service_id: parsed.data.service_id || null,
    published: parsed.data.published ? 1 : 0,
    sort_order: parsed.data.sort_order,
  };
  await adminUpdateTestimonial(id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  await adminDeleteTestimonial(id);
  return NextResponse.json({ ok: true });
}
