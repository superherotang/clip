import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] ${pathname} - Session: ${!!session}`);

  // Protected routes
  const protectedRoutes = ["/rooms", "/clipboard", "/api-docs", "/admin"];
  const authRoutes = ["/login", "/register"];

  // Check if trying to access protected route without authentication
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !session
  ) {
    console.log(`[Middleware] Redirecting to /login (no session)`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if trying to access auth routes while authenticated
  if (authRoutes.some((route) => pathname.startsWith(route)) && session) {
    console.log(`[Middleware] Redirecting to /rooms (has session)`);
    return NextResponse.redirect(new URL("/rooms", request.url));
  }

  console.log(`[Middleware] Allowing access to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
