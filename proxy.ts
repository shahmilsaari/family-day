import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "family_day_session";

// Routes that require authentication. The home page "/" and live display "/display"
// are intentionally public so guests can see the landing and projector view.
const protectedRoutes = ["/dashboard", "/events", "/api/tentative-pdf"];
const authRoutes = ["/login", "/register"];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && isProtectedPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/events", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/events/:path*", "/api/tentative-pdf/:path*", "/login", "/register"]
};