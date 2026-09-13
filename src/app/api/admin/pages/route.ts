import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminListPages } from "@/lib/cms";

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const pages = await adminListPages();
  return NextResponse.json({ pages });
}
