import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateWebsite } from "@/lib/claude";
import { deductTokens, TOKEN_COSTS } from "@/lib/tokens";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, category, answers } = await req.json();

    if (!prompt) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const resolvedCategory = category || "auto";

    // Deduct tokens
    const { success, remaining } = await deductTokens(
        session.user.id,
        TOKEN_COSTS.GENERATE
    );

    if (!success) {
        return NextResponse.json(
            { error: "Not enough tokens. Please purchase more.", remaining },
            { status: 403 }
        );
    }

    try {
        const website = await generateWebsite(prompt, resolvedCategory, answers);
        return NextResponse.json({ website, tokensRemaining: remaining });

    } catch (error) {
        console.error("AI generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate website. Please try again." },
            { status: 500 }
        );
    }
}
