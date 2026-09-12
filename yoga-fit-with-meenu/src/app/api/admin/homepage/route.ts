import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminListHomepageSections } from "@/lib/cms";

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const sections = await adminListHomepageSections();
  return NextResponse.json({ sections });
}
