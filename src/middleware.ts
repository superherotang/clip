import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ["/rooms", "/clipboard", "/api-docs"];
  const authRoutes = ["/login", "/register"];

  // Check if trying to access protected route without authentication
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !session
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if trying to access auth routes while authenticated
  if (authRoutes.some((route) => pathname.startsWith(route)) && session) {
    return NextResponse.redirect(new URL("/rooms", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
