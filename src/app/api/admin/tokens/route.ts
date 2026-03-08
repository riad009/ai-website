import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

// POST adjust tokens for a user (admin only)
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, amount, action } = await req.json();

    if (!userId || amount === undefined) {
        return NextResponse.json(
            { error: "userId and amount are required" },
            { status: 400 }
        );
    }

    const userResult = await pool.query(
        'SELECT id, tokens FROM "User" WHERE id = $1',
        [userId]
    );
    const user = userResult.rows[0];
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let newTokens: number;
    if (action === "set") {
        newTokens = Math.max(0, amount);
    } else if (action === "add") {
        newTokens = user.tokens + amount;
    } else if (action === "deduct") {
        newTokens = Math.max(0, user.tokens - amount);
    } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await pool.query(
        'UPDATE "User" SET tokens = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, tokens',
        [newTokens, userId]
    );

    return NextResponse.json({ id: updated.rows[0].id, tokens: parseInt(updated.rows[0].tokens) || 0 });
}
