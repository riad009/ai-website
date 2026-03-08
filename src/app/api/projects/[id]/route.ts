import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

// GET single project
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await pool.query(
        'SELECT * FROM "Project" WHERE id = $1 AND "userId" = $2',
        [id, session.user.id]
    );

    if (result.rows.length === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
}

// PATCH update project (rename, save content)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const existing = await pool.query(
        'SELECT id FROM "Project" WHERE id = $1 AND "userId" = $2',
        [id, session.user.id]
    );

    if (existing.rows.length === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const setClauses: string[] = ['"updatedAt" = NOW()'];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
        setClauses.push(`name = $${paramIndex++}`);
        values.push(body.name);
    }
    if (body.content !== undefined) {
        setClauses.push(`content = $${paramIndex++}`);
        values.push(JSON.stringify(body.content));
    }
    if (body.category !== undefined) {
        setClauses.push(`category = $${paramIndex++}`);
        values.push(body.category);
    }
    if (body.thumbnail !== undefined) {
        setClauses.push(`thumbnail = $${paramIndex++}`);
        values.push(body.thumbnail);
    }
    if (body.editor_data !== undefined) {
        setClauses.push(`editor_data = $${paramIndex++}`);
        values.push(typeof body.editor_data === "string" ? body.editor_data : JSON.stringify(body.editor_data));
    }
    if (body.subdomain !== undefined) {
        setClauses.push(`subdomain = $${paramIndex++}`);
        values.push(body.subdomain);
    }
    if (body.is_published !== undefined) {
        setClauses.push(`is_published = $${paramIndex++}`);
        values.push(body.is_published);
    }

    values.push(id);
    const result = await pool.query(
        `UPDATE "Project" SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
        values
    );

    return NextResponse.json(result.rows[0]);
}

// DELETE project
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await pool.query(
        'SELECT id FROM "Project" WHERE id = $1 AND "userId" = $2',
        [id, session.user.id]
    );

    if (existing.rows.length === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await pool.query('DELETE FROM "Project" WHERE id = $1', [id]);

    return NextResponse.json({ message: "Project deleted" });
}
