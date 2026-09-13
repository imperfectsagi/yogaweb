import { NextRequest, NextResponse } from "next/server";
import { getMediaBucket } from "@/lib/db";

/**
 * Fallback media server for when no R2 custom/public domain is configured
 * yet. Once you set R2_PUBLIC_URL (recommended for best performance — it
 * serves directly from Cloudflare's edge cache) this route becomes unused
 * for new uploads, but keeping it means nothing breaks either way.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const r2Key = decodeURIComponent(key);

  // Only serve keys under directories this app actually writes to via its
  // own upload endpoints — prevents path traversal / access to unrelated
  // bucket contents via a crafted URL. "uploads/" is used by the admin
  // media upload endpoint (banner, blog, testimonials, logo, favicon,
  // etc. — see /api/admin/media/upload); "reviews/" is used by the public
  // review-photo upload endpoint (/api/reviews/upload). Both need to be
  // allowed here, or photos from whichever one is missing 404 even though
  // they uploaded successfully and are sitting in R2 — this route was
  // previously missing "reviews/", which is exactly why review photos
  // never rendered.
  if (!r2Key.startsWith("uploads/") && !r2Key.startsWith("reviews/")) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const bucket = getMediaBucket();
  const object = await bucket.get(r2Key);
  if (!object) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const headers = new Headers();
  if (object.httpMetadata?.contentType) {
    headers.set("content-type", object.httpMetadata.contentType);
  }
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new NextResponse(object.body as unknown as ReadableStream, { headers });
}
