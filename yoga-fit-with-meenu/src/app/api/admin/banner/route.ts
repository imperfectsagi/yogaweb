import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getBannerSettings, setBannerSettings } from "@/lib/db";

const schema = z.object({
  type: z.enum(["image", "video"]),
  mediaId: z.string().min(1),
  url: z.string().url(),
  posterUrl: z.string().url().optional().nullable(),
  altText: z.string().max(200).optional().nullable(),
});

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const banner = await getBannerSettings();
  return NextResponse.json({ banner });
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
    return NextResponse.json({ error: "Invalid banner data." }, { status: 400 });
  }

  await setBannerSettings({
    type: parsed.data.type,
    mediaId: parsed.data.mediaId,
    url: parsed.data.url,
    posterUrl: parsed.data.posterUrl || null,
    altText: parsed.data.altText || null,
  });

  return NextResponse.json({ ok: true });
}
