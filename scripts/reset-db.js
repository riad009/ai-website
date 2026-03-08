require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function reset() {
    try {
        // Drop all existing tables (cascade to handle foreign keys)
        await pool.query(`
            DROP TABLE IF EXISTS "Payment" CASCADE;
            DROP TABLE IF EXISTS "Project" CASCADE;
            DROP TABLE IF EXISTS "Template" CASCADE;
            DROP TABLE IF EXISTS "User" CASCADE;
            DROP TABLE IF EXISTS "CreditTransaction" CASCADE;
            DROP TABLE IF EXISTS "DescriptiveStatement" CASCADE;
            DROP TABLE IF EXISTS "Document" CASCADE;
            DROP TABLE IF EXISTS "ElevationData" CASCADE;
            DROP TABLE IF EXISTS "FeasibilityReport" CASCADE;
            DROP TABLE IF EXISTS "ProtectedArea" CASCADE;
            DROP TABLE IF EXISTS "RegulatoryAnalysis" CASCADE;
            DROP TABLE IF EXISTS "SectionData" CASCADE;
            DROP TABLE IF EXISTS "SitePlanData" CASCADE;
            DROP TABLE IF EXISTS "Subscription" CASCADE;
            DROP TABLE IF EXISTS "SubscriptionPlan" CASCADE;
            DROP TABLE IF EXISTS "TerrainData" CASCADE;

            DROP TYPE IF EXISTS "UserRole" CASCADE;
            DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
            DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
            DROP TYPE IF EXISTS "CreditTransactionType" CASCADE;
            DROP TYPE IF EXISTS "DocumentType" CASCADE;
        `);
        console.log('Old tables dropped.');

        // Create fresh tables for AI Website Builder
        await pool.query(`
            CREATE TABLE "User" (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'USER',
                tokens INTEGER NOT NULL DEFAULT 50,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE "Project" (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT 'business',
                content JSONB NOT NULL DEFAULT '{}',
                thumbnail TEXT,
                "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE "Payment" (
                id TEXT PRIMARY KEY,
                amount INTEGER NOT NULL,
                tokens INTEGER NOT NULL,
                "stripeSessionId" TEXT UNIQUE NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDING',
                "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE "Template" (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                thumbnail TEXT NOT NULL DEFAULT '',
                content JSONB NOT NULL,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX idx_project_userid ON "Project"("userId");
            CREATE INDEX idx_payment_userid ON "Payment"("userId");
        `);
        console.log('New tables created successfully!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

reset();
