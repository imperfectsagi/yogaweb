import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminListPackageReviews, adminCreatePackageReview, type PackageReviewInput } from "@/lib/cms";

const schema = z.object({
  package_id: z.string().min(1, "Choose a package."),
  customer_name: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(1).max(2000),
  images: z.array(z.string()).max(6).optional(),
  status: z.enum(["pending", "approved", "rejected"]),
  admin_note: z.string().max(1000).nullable().optional(),
});

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const reviews = await adminListPackageReviews();
  return NextResponse.json({ reviews });
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
  const data: PackageReviewInput = {
    package_id: parsed.data.package_id,
    customer_name: parsed.data.customer_name,
    rating: parsed.data.rating,
    review_text: parsed.data.review_text,
    images_json: parsed.data.images?.length ? JSON.stringify(parsed.data.images) : null,
    status: parsed.data.status,
    admin_note: parsed.data.admin_note || null,
  };
  const id = await adminCreatePackageReview(data);
  return NextResponse.json({ ok: true, id });
}
