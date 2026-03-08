import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

// GET all users (admin only)
export async function GET() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Try query with Payment table first
        let result;
        try {
            result = await pool.query(`
                SELECT u.id, u.name, u.email, u.role, u.tokens, u."createdAt",
                    (SELECT COUNT(*) FROM "Project" p WHERE p."userId" = u.id)::int AS "_count_projects",
                    (SELECT COUNT(*) FROM "Payment" pay WHERE pay."userId" = u.id)::int AS "_count_payments"
                FROM "User" u
                ORDER BY u."createdAt" DESC
            `);
        } catch {
            // Fallback if Payment table doesn't exist
            result = await pool.query(`
                SELECT u.id, u.name, u.email, u.role, u.tokens, u."createdAt",
                    (SELECT COUNT(*) FROM "Project" p WHERE p."userId" = u.id)::int AS "_count_projects",
                    0 AS "_count_payments"
                FROM "User" u
                ORDER BY u."createdAt" DESC
            `);
        }

        const users = result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            tokens: parseInt(row.tokens) || 0,
            createdAt: row.createdAt,
            _count: {
                projects: row._count_projects || 0,
                payments: row._count_payments || 0,
            },
        }));

        return NextResponse.json(users);
    } catch (error) {
        console.error("Admin users error:", error);
        return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
    }
}
