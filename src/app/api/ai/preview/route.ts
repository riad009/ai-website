import { NextRequest, NextResponse } from "next/server";
import { generateWebsite } from "@/lib/claude";

// Simple in-memory rate limit (per IP, 3 generations per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
        return true;
    }
    if (entry.count >= 5) return false;
    entry.count++;
    return true;
}

export async function POST(req: NextRequest) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";

    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: "Rate limit exceeded. Please sign up for unlimited access." },
            { status: 429 }
        );
    }

    try {
        const { prompt, category } = await req.json();

        if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
            return NextResponse.json({ error: "Please enter a valid description." }, { status: 400 });
        }

        const website = await generateWebsite(prompt.trim(), category || "business");
        return NextResponse.json({ website });
    } catch (error) {
        console.error("Preview generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate website. Please try again." },
            { status: 500 }
        );
    }
}
