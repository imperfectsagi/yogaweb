import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getAllSiteSettings, setSiteSettings } from "@/lib/cms";

// Strict 6-digit HEX (#RRGGBB) or 3-digit shorthand (#RGB). Empty string
// is explicitly allowed and means "clear this override, use the built-in
// default" — every color field is optional, and clearing one never
// affects any other field. Anything else (named colors, rgb(), partial
// hex, stray whitespace-only junk) is rejected with a 400 rather than
// silently saved, so invalid values can never reach the homepage.
const hexColor = z
  .string()
  .max(9)
  .refine((v) => v === "" || /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v), {
    message: "Color must be a valid HEX code, e.g. #2F6657.",
  })
  .optional();

const schema = z.object({
  site_logo_url: z.string().optional(),
  site_favicon_url: z.string().optional(),
  site_whatsapp_message: z.string().max(500).optional(),
  social_instagram: z.string().max(300).optional(),
  social_facebook: z.string().max(300).optional(),
  social_youtube: z.string().max(300).optional(),
  business_hours: z.string().max(500).optional(),
  header_nav_text_color: hexColor,
  hero_eyebrow_text_color: hexColor,
  hero_heading_text_color: hexColor,
  hero_description_text_color: hexColor,
  hero_cta_text_color: hexColor,
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
