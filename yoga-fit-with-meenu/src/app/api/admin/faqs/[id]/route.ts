import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminGetFaq, adminUpdateFaq, adminDeleteFaq, type FaqInput } from "@/lib/cms";

const schema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(3000),
  sort_order: z.number().int().default(0),
  published: z.boolean(),
  show_on_homepage: z.boolean(),
  service_id: z.string().nullable().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const faq = await adminGetFaq(id);
  if (!faq) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ faq });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const existing = await adminGetFaq(id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data." }, { status: 400 });
  }
  const data: FaqInput = {
    question: parsed.data.question,
    answer: parsed.data.answer,
    sort_order: parsed.data.sort_order,
    published: parsed.data.published ? 1 : 0,
    show_on_homepage: parsed.data.show_on_homepage ? 1 : 0,
    service_id: parsed.data.service_id || null,
  };
  await adminUpdateFaq(id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  await adminDeleteFaq(id);
  return NextResponse.json({ ok: true });
}
