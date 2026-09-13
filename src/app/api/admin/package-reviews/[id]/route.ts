import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  adminGetPackageReview,
  adminUpdatePackageReview,
  adminDeletePackageReview,
  adminSetPackageReviewStatus,
  type PackageReviewInput,
} from "@/lib/cms";

const schema = z.object({
  package_id: z.string().min(1, "Choose a package."),
  customer_name: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(1).max(2000),
  images: z.array(z.string()).max(6).optional(),
  status: z.enum(["pending", "approved", "rejected"]),
  admin_note: z.string().max(1000).nullable().optional(),
});

// A separate, smaller schema for the quick Approve/Reject buttons on the
// list screen, which only ever change `status` and shouldn't require the
// caller to resend the entire review body.
const statusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const review = await adminGetPackageReview(id);
  if (!review) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ review });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const existing = await adminGetPackageReview(id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await request.json().catch(() => null);

  // PATCH-style status-only payload (used by the Approve/Reject quick
  // actions) is accepted here too, so the client only needs one endpoint
  // per review id for both the full edit form and the quick actions.
  const statusOnly = statusSchema.safeParse(body);
  if (statusOnly.success && body && Object.keys(body).length === 1) {
    await adminSetPackageReviewStatus(id, statusOnly.data.status);
    return NextResponse.json({ ok: true });
  }

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
  await adminUpdatePackageReview(id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  await adminDeletePackageReview(id);
  return NextResponse.json({ ok: true });
}
