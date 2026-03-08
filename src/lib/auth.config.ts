import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
    providers: [], // providers are added in auth.ts (needs Node.js runtime)
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.tokens = (user as any).tokens;
            }
            if (trigger === "update" && session) {
                token.tokens = session.tokens;
                if (session.role) token.role = session.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
                (session.user as any).tokens = token.tokens;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = (auth?.user as any)?.role;
            const pathname = nextUrl.pathname;

            // Protect dashboard routes
            if (
                pathname.startsWith("/dashboard") ||
                pathname.startsWith("/projects") ||
                pathname.startsWith("/templates") ||
                pathname.startsWith("/billing")
            ) {
                return isLoggedIn;
            }

            // Protect admin routes
            if (pathname.startsWith("/admin")) {
                if (!isLoggedIn) return false;
                if (userRole !== "ADMIN") {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
                return true;
            }

            // Redirect logged-in users away from auth pages
            if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            return true;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
};
