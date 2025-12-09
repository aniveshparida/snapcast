import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Allow the public landing page to be accessible without auth
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  // Avoid calling into the auth database from Edge middleware (DB drivers don't work in edge).
  // Instead, check for the presence of the Better Auth session cookie in the incoming request.
  // The actual session lookup (which requires DB) will be performed in server handlers where Node runtime is available.
  const cookieHeader = request.headers.get('cookie') || '';
  const hasSessionCookie = cookieHeader.includes('better-auth.session');

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)"],
};