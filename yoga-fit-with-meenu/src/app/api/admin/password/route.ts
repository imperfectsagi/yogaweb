import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getSession,
  verifyPassword,
  hashPassword,
  isPasswordStrongEnough,
} from "@/lib/auth";
import { getUserById, updateUserPassword } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  const session = await getSession().catch(() => null);
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limit = await checkRateLimit(
    `pwd-change:${session.sub}:${ip}`,
    5,
    10 * 60
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;

  const strength = isPasswordStrongEnough(newPassword);
  if (!strength.ok) {
    return NextResponse.json({ error: strength.reason }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return NextResponse.json(
      { error: "New password must be different from the current password." },
      { status: 400 }
    );
  }

  const user = await getUserById(session.sub).catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const valid = await verifyPassword(currentPassword, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  const newHash = await hashPassword(newPassword);
  await updateUserPassword(user.id, newHash);

  return NextResponse.json({ ok: true });
}
