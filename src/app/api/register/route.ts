import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool, generateId } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const existing = await pool.query(
            'SELECT id FROM "User" WHERE email = $1',
            [email]
        );
        if (existing.rows.length > 0) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const id = generateId();

        const result = await pool.query(
            'INSERT INTO "User" (id, name, email, "passwordHash", tokens, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, 50, NOW(), NOW()) RETURNING id',
            [id, name, email, hashedPassword]
        );

        return NextResponse.json(
            { message: "Account created successfully", userId: result.rows[0].id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
