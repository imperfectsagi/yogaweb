import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getTheme } from "@/lib/db";
import { adminUpdateTheme, DEFAULT_THEME } from "@/lib/cms";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color, e.g. #2D5A4A");

const schema = z.object({
  primary_color: hex,
  secondary_color: hex,
  accent_color: hex,
  background_color: hex,
  foreground_color: hex,
  muted_color: hex,
  border_color: hex,
  button_radius: z.string().max(20),
  card_radius: z.string().max(20),
});

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const theme = (await getTheme()) || { id: 1, ...DEFAULT_THEME, updated_at: "" };
  return NextResponse.json({ theme });
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid theme data." }, { status: 400 });
  }
  await adminUpdateTheme(parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  await adminUpdateTheme(DEFAULT_THEME);
  return NextResponse.json({ ok: true, theme: DEFAULT_THEME });
}
