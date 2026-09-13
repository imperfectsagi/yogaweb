/**
 * Secure auth helpers for admin.
 * Uses bcryptjs for hashing + jose for JWT/session cookies.
 * All checks must be server-side.
 */

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getEnv } from "./db";

const SESSION_COOKIE = "yf_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  // Prefer the Cloudflare Worker secret (set via `wrangler secret put`), and
  // fall back to process.env for local `next dev` without bindings.
  let secret: string | undefined;
  try {
    const env = getEnv();
    secret = env?.AUTH_SECRET || env?.SESSION_SECRET;
  } catch {
    // getCloudflareContext not available (e.g. plain `next dev`) — fall through
  }
  secret = secret || process.env.AUTH_SECRET || process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET / SESSION_SECRET must be set (min 32 chars)");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export type SessionPayload = {
  sub: string; // user id
  email: string;
  role: "admin" | "editor";
  name: string;
};

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin(
  roles: Array<"admin" | "editor"> = ["admin", "editor"]
) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

/** Minimum password policy enforced everywhere a password is set/changed. */
export function isPasswordStrongEnough(password: string): { ok: boolean; reason?: string } {
  if (password.length < 10) {
    return { ok: false, reason: "Password must be at least 10 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { ok: false, reason: "Password must include an uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { ok: false, reason: "Password must include a lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false, reason: "Password must include a number." };
  }
  return { ok: true };
}
