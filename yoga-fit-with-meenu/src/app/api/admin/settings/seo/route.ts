import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getSeoSettings, adminUpdateSeoSettings } from "@/lib/cms";

const schema = z.object({
  site_name: z.string().min(1).max(200),
  default_title: z.string().min(1).max(200),
  default_description: z.string().min(1).max(500),
  default_og_image: z.string().nullable().optional(),
  organization_name: z.string().min(1).max(200),
  logo_url: z.string().nullable().optional(),
});

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const seo = await getSeoSettings();
  return NextResponse.json({ seo });
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
  await adminUpdateSeoSettings({
    site_name: parsed.data.site_name,
    default_title: parsed.data.default_title,
    default_description: parsed.data.default_description,
    default_og_image: parsed.data.default_og_image || null,
    organization_name: parsed.data.organization_name,
    logo_url: parsed.data.logo_url || null,
  });
  return NextResponse.json({ ok: true });
}
