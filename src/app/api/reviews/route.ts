import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPackageReview, getDb } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// The review-photo upload endpoint (/api/reviews/upload) returns an
// absolute URL when R2_PUBLIC_URL is configured, or a relative
// `/api/media/...` fallback path when it isn't (see that route and
// getMediaBucket in src/lib/db.ts). z.string().url() rejects relative
// paths outright, which silently broke photo attachments whenever no R2
// public domain was set — the exact same bug already found and fixed for
// the homepage banner (see CMS_UPDATE_GUIDE.md §5). This accepts both
// forms instead of only absolute URLs.
const reviewImageUrl = z
  .string()
  .refine(
    (val) => /^https?:\/\//.test(val) || val.startsWith("/api/media/"),
    { message: "Invalid image URL." }
  );

const schema = z.object({
  package_id: z.string().min(1),
  customer_name: z.string().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(5).max(2000),
  images: z.array(reviewImageUrl).max(4).optional(),
  // Honeypot field — real visitors never fill this in.
  website: z.string().max(0).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // A real customer reviews a package once in a while, not repeatedly —
  // 5 submissions per 30 minutes per IP stops scripted review spam while
  // staying generous for a genuine visitor.
  const limit = await checkRateLimit(`review:${ip}`, 5, 30 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many reviews submitted. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Please check the form — some fields look invalid." },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    // Honeypot tripped — pretend success so bots don't learn otherwise.
    return NextResponse.json({ ok: true });
  }

  // Confirm the package is real and currently active before accepting a
  // review for it, so reviews can't be attached to a made-up/deleted
  // package id.
  const db = getDb();
  const pkg = await db
    .prepare(`SELECT id FROM packages WHERE id = ? AND is_active = 1`)
    .bind(parsed.data.package_id)
    .first<{ id: string }>();
  if (!pkg) {
    return NextResponse.json({ error: "This package could not be found." }, { status: 404 });
  }

  await createPackageReview({
    package_id: parsed.data.package_id,
    customer_name: parsed.data.customer_name,
    rating: parsed.data.rating,
    review_text: parsed.data.review_text,
    images_json: parsed.data.images?.length ? JSON.stringify(parsed.data.images) : null,
  });

  return NextResponse.json({
    ok: true,
    message: "Thank you! Your review has been submitted and will appear once approved.",
  });
}
