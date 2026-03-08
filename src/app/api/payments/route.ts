import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
        'SELECT * FROM "Payment" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
        [session.user.id]
    );

    return NextResponse.json(result.rows);
}
