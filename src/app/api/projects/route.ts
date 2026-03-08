import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pool, generateId } from "@/lib/db";

// GET all projects for current user
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
        'SELECT id, name, category, thumbnail, is_published, subdomain, "createdAt", "updatedAt" FROM "Project" WHERE "userId" = $1 ORDER BY "updatedAt" DESC',
        [session.user.id]
    );

    return NextResponse.json(result.rows);
}

// POST create new project
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, category, content, editor_data } = await req.json();
        const id = generateId();

        const result = await pool.query(
            'INSERT INTO "Project" (id, name, category, content, editor_data, "userId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
            [id, name || "Untitled Project", category || "business", JSON.stringify(content || {}), editor_data ? JSON.stringify(editor_data) : null, session.user.id]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        console.error("Create project error:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
