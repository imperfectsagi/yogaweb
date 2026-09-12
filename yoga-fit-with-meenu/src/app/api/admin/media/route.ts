import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listMedia, deleteMediaRecord, findMediaUsage, getMediaBucket } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const media = await listMedia(200);
  return NextResponse.json({ media });
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const url = searchParams.get("url") || "";
  const force = searchParams.get("force") === "1";

  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  if (!force) {
    const usages = await findMediaUsage(url);
    if (usages.length) {
      return NextResponse.json(
        { error: "This file is currently in use.", usages, requiresConfirmation: true },
        { status: 409 }
      );
    }
  }

  const r2Key = await deleteMediaRecord(id);
  if (r2Key) {
    try {
      const bucket = getMediaBucket();
      await bucket.delete(r2Key);
    } catch {
      // R2 delete failure shouldn't block the DB record from being removed;
      // the object becomes orphaned but that's recoverable via the bucket
      // dashboard, whereas leaving a dangling DB row is worse for the admin UI.
    }
  }
  return NextResponse.json({ ok: true });
}
