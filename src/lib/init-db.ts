import { pool } from "./db";

export async function initDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS "User" (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'USER',
                tokens INTEGER NOT NULL DEFAULT 50,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS "Project" (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT 'business',
                content JSONB NOT NULL DEFAULT '{}',
                thumbnail TEXT,
                "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS "Payment" (
                id TEXT PRIMARY KEY,
                amount INTEGER NOT NULL,
                tokens INTEGER NOT NULL,
                "stripeSessionId" TEXT UNIQUE NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDING',
                "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS "Template" (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                thumbnail TEXT NOT NULL DEFAULT '',
                content JSONB NOT NULL,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS "Chat" (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT 'New Chat',
                messages JSONB NOT NULL DEFAULT '[]',
                "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_project_userid ON "Project"("userId");
            CREATE INDEX IF NOT EXISTS idx_payment_userid ON "Payment"("userId");
            CREATE INDEX IF NOT EXISTS idx_chat_userid ON "Chat"("userId");
        `);
        console.log("Database tables initialized successfully");
    } finally {
        client.release();
    }
}
