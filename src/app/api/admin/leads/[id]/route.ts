import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

const schema = z.object({
  status: z.enum(["new", "contacted", "trial_scheduled", "joined", "not_interested", "closed"]),
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
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const db = getDb();
  await db
    .prepare(`UPDATE leads SET status = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(parsed.data.status, id)
    .run();
  return NextResponse.json({ ok: true });
}
