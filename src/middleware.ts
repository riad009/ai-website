import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionToken =
        request.cookies.get("authjs.session-token")?.value ||
        request.cookies.get("__Secure-authjs.session-token")?.value;
    const isLoggedIn = !!sessionToken;

    // Protect dashboard routes
    if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/projects") ||
        pathname.startsWith("/templates") ||
        pathname.startsWith("/billing")
    ) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Redirect logged-in users away from auth pages
    if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/projects/:path*",
        "/templates/:path*",
        "/billing/:path*",
        "/admin/:path*",
        "/login",
        "/register",
    ],
};
