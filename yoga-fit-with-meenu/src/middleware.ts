import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "yf_session";

// Centralized, edge-level gate for the admin panel: this runs BEFORE any
// /admin page or layout code, so a request with no session cookie at all
// never even reaches admin page rendering — it's redirected straight to
// the login screen immediately.
//
// This is intentionally a lightweight PRESENCE check only (cookie exists?),
// not a full JWT signature/expiry verification — that verification already
// happens, correctly and safely, in every admin page and admin API route
// via requireAdmin()/getSession() in src/lib/auth.ts (which uses `jose` +
// the Cloudflare-bound AUTH_SECRET via getCloudflareContext()). Duplicating
// that full verification here in Middleware would mean re-deriving the
// secret in a second, less-proven execution context — for this app's
// architecture, the safer and equally effective design is: middleware
// blocks the "no cookie at all" case fast and cheaply at the edge, and the
// existing per-page/per-API checks remain the single source of truth for
// "is this token actually valid" (defense in depth, not a replacement).
//
// The login page is intentionally excluded via the matcher below so the
// flow doesn't redirect-loop, and API routes are left to their own
// requireAdmin() checks (which return proper 401 JSON instead of a
// redirect, which is what API callers expect).
export function middleware(request: NextRequest) {
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Every /admin page EXCEPT the login page itself, which must stay
  // reachable while logged out. Listed as two explicit patterns (rather
  // than one clever regex) so the bare "/admin" dashboard route is
  // definitely included — a single "/admin/:path*"-style pattern would
  // miss "/admin" itself with no trailing segment.
  matcher: ["/admin", "/admin/((?!login).*)"],
};
