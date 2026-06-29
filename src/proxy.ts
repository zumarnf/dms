import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Next.js 16 "proxy" (formerly "middleware"). Optimistic route protection:
 * redirect to /login when no session cookie is present. This is a fast gate
 * only — real authorization is enforced server-side in pages/Server Actions via
 * `processes/auth/guard` (security.md: never trust a cookie's mere presence).
 */
export function proxy(req: NextRequest) {
  const sessionCookie = getSessionCookie(req, { cookiePrefix: "dms" });
  if (!sessionCookie) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/documents/:path*",
    "/folders/:path*",
    "/trash/:path*",
    "/activity/:path*",
    "/notifications/:path*",
    "/admin/:path*",
  ],
};
