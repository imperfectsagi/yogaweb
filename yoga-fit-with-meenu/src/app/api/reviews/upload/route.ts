import { NextRequest, NextResponse } from "next/server";
import { getMediaBucket, insertMediaRecord, getEnv } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Public (unauthenticated) image upload used only by the "Write a review"
 * form on the pricing page, so a visitor can attach a photo to their
 * review without needing an admin login. Deliberately stricter than the
 * admin upload endpoint (/api/admin/media/upload):
 *   - images only, no video
 *   - smaller size cap (3 MB vs 5 MB) and a per-IP request limit
 *   - stored in the same R2 bucket + `media` table so it shows up
 *     alongside admin-uploaded assets, but the review row itself stays
 *     'pending' until an admin approves it, so an unmoderated image can
 *     never appear on the live site through this path alone.
 */
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  return map[mime] || "bin";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Generous enough for someone attaching a couple of photos to one
  // review, but blocks scripted flooding of R2 storage.
  const limit = await checkRateLimit(`review-upload:${ip}`, 10, 15 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Please upload a JPG, PNG, WebP or AVIF image." },
      { status: 400 }
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: `Image is too large. Maximum size is ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB.` },
      { status: 400 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  const bucket = getMediaBucket();
  const env = getEnv();
  const id = crypto.randomUUID();
  const ext = extFromMime(file.type);
  const r2Key = `reviews/${new Date().toISOString().slice(0, 7)}/${id}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  await bucket.put(r2Key, arrayBuffer, { httpMetadata: { contentType: file.type } });

  const publicBase = env?.R2_PUBLIC_URL?.replace(/\/$/, "") || "";
  const url = publicBase ? `${publicBase}/${r2Key}` : `/api/media/${encodeURIComponent(r2Key)}`;

  await insertMediaRecord({
    id,
    filename: `${id}.${ext}`,
    originalFilename: file.name,
    r2Key,
    url,
    mimeType: file.type,
    fileSize: file.size,
    altText: "Customer review photo",
  });

  return NextResponse.json({ ok: true, url });
}
