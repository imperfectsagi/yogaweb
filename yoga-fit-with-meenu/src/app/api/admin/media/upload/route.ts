import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getMediaBucket, insertMediaRecord, getEnv } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Hard caps — enforced server-side (client-side limits can always be
// bypassed, so this is the real guard).
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  return map[mime] || "bin";
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  // Throttle uploads so one account can't flood R2 storage/bandwidth.
  const ip = getClientIp(request);
  const limit = await checkRateLimit(`upload:${ip}`, 20, 60 * 10);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);

  if (!isImage && !isVideo) {
    return NextResponse.json(
      {
        error:
          "Unsupported file type. Use JPG, PNG, WebP or AVIF for images, or MP4/WebM for video.",
      },
      { status: 400 }
    );
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    return NextResponse.json(
      { error: `File is too large. Maximum size is ${limitMb} MB.` },
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
  const r2Key = `uploads/${new Date().toISOString().slice(0, 7)}/${id}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();

  await bucket.put(r2Key, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });

  const publicBase = env?.R2_PUBLIC_URL?.replace(/\/$/, "") || "";
  const url = publicBase
    ? `${publicBase}/${r2Key}`
    : `/api/media/${encodeURIComponent(r2Key)}`; // fallback if no public domain configured yet

  await insertMediaRecord({
    id,
    filename: `${id}.${ext}`,
    originalFilename: file.name,
    r2Key,
    url,
    mimeType: file.type,
    fileSize: file.size,
  });

  return NextResponse.json({
    ok: true,
    media: { id, url, mimeType: file.type, fileSize: file.size, kind: isImage ? "image" : "video" },
  });
}
