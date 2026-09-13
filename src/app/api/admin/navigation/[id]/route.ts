import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminUpdateNavItem, adminDeleteNavItem, type NavigationInput } from "@/lib/cms";

const schema = z.object({
  location: z.enum(["main", "footer", "mobile"]),
  label: z.string().min(1).max(100),
  url: z.string().min(1).max(300),
  sort_order: z.number().int().default(0),
  is_external: z.boolean(),
  is_active: z.boolean(),
  parent_id: z.string().nullable().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data." }, { status: 400 });
  }
  const data: NavigationInput = {
    location: parsed.data.location,
    label: parsed.data.label,
    url: parsed.data.url,
    sort_order: parsed.data.sort_order,
    is_external: parsed.data.is_external ? 1 : 0,
    is_active: parsed.data.is_active ? 1 : 0,
    parent_id: parsed.data.parent_id || null,
  };
  await adminUpdateNavItem(id, data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  await adminDeleteNavItem(id);
  return NextResponse.json({ ok: true });
}
