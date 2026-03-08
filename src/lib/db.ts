import { Pool } from "pg";

const globalForPool = globalThis as unknown as {
    pool: Pool | undefined;
};

export const pool =
    globalForPool.pool ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
    });

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;

// Helper to generate cuid-like IDs
export function generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `c${timestamp}${random}`;
}
