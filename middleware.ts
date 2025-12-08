import { NextRequest, NextResponse } from "next/server";

// Edge-safe auth gate: check only for the presence of Better Auth session cookie.
// Do NOT call the database from middleware; Edge runtime cannot use Node drivers.
export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie || !sessionCookie.value) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)"],
};
