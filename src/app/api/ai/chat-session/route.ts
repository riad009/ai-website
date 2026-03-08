import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chatWithWebsite } from "@/lib/claude";
import { deductTokens, TOKEN_COSTS } from "@/lib/tokens";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history, currentWebsite } = await req.json();

    if (!message) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!currentWebsite) {
        return NextResponse.json({ error: "Current website data is required" }, { status: 400 });
    }

    // Deduct 1 token per chat message (cheaper than full generation)
    const { success, remaining } = await deductTokens(
        session.user.id,
        TOKEN_COSTS.IMPROVE
    );

    if (!success) {
        return NextResponse.json(
            { error: "Not enough tokens. Please purchase more.", remaining },
            { status: 403 }
        );
    }

    try {
        const result = await chatWithWebsite(
            currentWebsite,
            history || [],
            message
        );
        return NextResponse.json({
            message: result.message,
            website: result.website,
            tokensRemaining: remaining,
        });
    } catch (error) {
        console.error("AI chat error:", error);
        return NextResponse.json(
            { error: "Failed to process instruction. Please try again." },
            { status: 500 }
        );
    }
}
