import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminUpdateHomepageSection } from "@/lib/cms";

const schema = z.object({
  enabled: z.boolean(),
  sort_order: z.number().int().default(0),
  heading: z.string().max(200).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  image_url: z.string().nullable().optional(),
  cta_text: z.string().max(50).nullable().optional(),
  cta_url: z.string().max(300).nullable().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data." }, { status: 400 });
  }
  await adminUpdateHomepageSection(id, {
    enabled: parsed.data.enabled ? 1 : 0,
    sort_order: parsed.data.sort_order,
    heading: parsed.data.heading || null,
    description: parsed.data.description || null,
    image_url: parsed.data.image_url || null,
    cta_text: parsed.data.cta_text || null,
    cta_url: parsed.data.cta_url || null,
  });
  return NextResponse.json({ ok: true });
}
