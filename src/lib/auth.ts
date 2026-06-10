import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { pool } from "./db";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const result = await pool.query(
                    'SELECT id, email, "passwordHash", name, role, tokens FROM "User" WHERE email = $1',
                    [credentials.email as string]
                );
                const user = result.rows[0];

                if (!user) return null;

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    tokens: user.tokens,
                };
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account }) {
            // Credentials sign-in is already validated in `authorize`.
            if (account?.provider !== "google") return true;
            if (!user.email) return false;

            // Look up or create the matching row in our custom User table so
            // the JWT callback can populate id/role/tokens from the DB.
            const existing = await pool.query(
                'SELECT id, role, tokens FROM "User" WHERE email = $1',
                [user.email]
            );
            let dbUser = existing.rows[0];

            if (!dbUser) {
                const id = "user_" + crypto.randomUUID();
                const inserted = await pool.query(
                    'INSERT INTO "User" (id, email, "passwordHash", name, role, tokens, credits, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id, role, tokens',
                    [id, user.email, "GOOGLE_OAUTH", user.name || user.email.split("@")[0], "USER", 100, 0]
                );
                dbUser = inserted.rows[0];
            }

            // Mutate the user object so the downstream jwt callback reads DB values.
            user.id = dbUser.id;
            (user as any).role = dbUser.role;
            (user as any).tokens = Number(dbUser.tokens);
            return true;
        },
    },
});
