import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT * FROM leads ORDER BY created_at DESC LIMIT 200`)
    .all();
  return NextResponse.json({ leads: results || [] });
}
