import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getBannerSettings, setBannerSettings } from "@/lib/db";

const schema = z.object({
  type: z.enum(["image", "video"]).nullable(),
  mediaId: z.string().nullable(),
  url: z.string().nullable(),
  posterUrl: z.string().nullable().optional(),
  altText: z.string().max(200).nullable().optional(),
  focalX: z.number().min(0).max(100).optional(),
  focalY: z.number().min(0).max(100).optional(),
  fit: z.enum(["cover", "contain"]).optional(),
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

  // Removing the banner: all fields come through null/empty.
  const isClearing = !parsed.data.url || !parsed.data.type;
  if (!isClearing) {
    // Accept both absolute URLs (R2_PUBLIC_URL-based) and the relative
    // /api/media/[key] fallback path used when no public R2 domain is set.
    const isAbsolute = /^https?:\/\//.test(parsed.data.url!);
    const isRelativeFallback = parsed.data.url!.startsWith("/api/media/");
    if (!isAbsolute && !isRelativeFallback) {
      return NextResponse.json({ error: "Invalid banner URL." }, { status: 400 });
    }
    if (!parsed.data.mediaId) {
      return NextResponse.json({ error: "Missing media reference." }, { status: 400 });
    }
  }

  await setBannerSettings({
    type: parsed.data.type,
    mediaId: parsed.data.mediaId,
    url: parsed.data.url,
    posterUrl: parsed.data.posterUrl || null,
    altText: parsed.data.altText || null,
    focalX: parsed.data.focalX ?? 50,
    focalY: parsed.data.focalY ?? 50,
    fit: parsed.data.fit || "contain",
  });

  return NextResponse.json({ ok: true });
}
