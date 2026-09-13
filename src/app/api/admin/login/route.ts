import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

// 8 attempts per 10 minutes per IP, and separately per email, to slow down
// both distributed and targeted brute-force attempts without locking out a
// legitimate admin for long.
const IP_LIMIT = 8;
const EMAIL_LIMIT = 6;
const WINDOW_SECONDS = 10 * 60;

function fail(message: string, status: number, retryAfterSeconds?: number) {
  const res = NextResponse.json({ error: message }, { status });
  if (retryAfterSeconds) res.headers.set("Retry-After", String(retryAfterSeconds));
  return res;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Support both JSON (fetch from the admin UI) and classic form posts.
  let body: unknown;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await request.json().catch(() => null);
  } else {
    const form = await request.formData().catch(() => null);
    body = form ? Object.fromEntries(form.entries()) : null;
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Enter a valid email and password.", 400);
  }
  const { email, password } = parsed.data;

  const ipLimit = await checkRateLimit(`login:ip:${ip}`, IP_LIMIT, WINDOW_SECONDS);
  if (!ipLimit.allowed) {
    return fail(
      "Too many login attempts from this network. Try again later.",
      429,
      ipLimit.retryAfterSeconds
    );
  }

  const emailLimit = await checkRateLimit(
    `login:email:${email.toLowerCase()}`,
    EMAIL_LIMIT,
    WINDOW_SECONDS
  );
  if (!emailLimit.allowed) {
    return fail(
      "Too many attempts for this account. Try again later.",
      429,
      emailLimit.retryAfterSeconds
    );
  }

  const user = await getUserByEmail(email).catch(() => null);

  // Always run bcrypt.compare (even against a dummy hash) so response timing
  // doesn't reveal whether the email exists.
  const dummyHash = "$2a$12$C6UzMDM.H6dfI/f/IKcEeOxNS9WHo.BW4KfKzABYFm.eDRq3iM4Vq";
  const isValid = await verifyPassword(password, user?.password_hash || dummyHash);

  if (!user || !isValid) {
    return fail("Invalid email or password.", 401);
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  await setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    user: { name: user.name, email: user.email, role: user.role },
  });
}
