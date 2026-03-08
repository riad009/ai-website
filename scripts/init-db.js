require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function init() {
    try {
        await pool.query(`
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

            CREATE INDEX IF NOT EXISTS idx_project_userid ON "Project"("userId");
            CREATE INDEX IF NOT EXISTS idx_payment_userid ON "Payment"("userId");

            -- Add missing columns to existing tables if they don't exist
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'password') THEN
                    ALTER TABLE "User" ADD COLUMN password TEXT NOT NULL DEFAULT '';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'updatedAt') THEN
                    ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'userId') THEN
                    ALTER TABLE "Project" ADD COLUMN "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'updatedAt') THEN
                    ALTER TABLE "Project" ADD COLUMN "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();
                END IF;
            END $$;
        `);
        console.log('Database tables initialized successfully!');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await pool.end();
    }
}

init();
