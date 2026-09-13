import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getAllSiteSettings, setSiteSettings } from "@/lib/cms";

const schema = z.object({
  site_logo_url: z.string().optional(),
  site_favicon_url: z.string().optional(),
  site_whatsapp_message: z.string().max(500).optional(),
  social_instagram: z.string().max(300).optional(),
  social_facebook: z.string().max(300).optional(),
  social_youtube: z.string().max(300).optional(),
  business_hours: z.string().max(500).optional(),
});

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const settings = await getAllSiteSettings();
  return NextResponse.json({ settings });
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
  await setSiteSettings(parsed.data);
  return NextResponse.json({ ok: true });
}
