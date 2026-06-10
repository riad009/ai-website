import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { planWebsite } from "@/lib/claude";
import { deductTokens, TOKEN_COSTS } from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, category, answers, model, designBrief } = await req.json();

    if (!prompt) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Deduct tokens once, at the planning stage (the per-section calls are free).
    const { success, remaining } = await deductTokens(session.user.id, TOKEN_COSTS.GENERATE);
    if (!success) {
        return NextResponse.json(
            { error: "Not enough tokens. Please purchase more.", remaining },
            { status: 403 }
        );
    }

    try {
        const plan = await planWebsite(prompt, category || "auto", answers, model, designBrief);
        return NextResponse.json({ plan, tokensRemaining: remaining });
    } catch (error) {
        console.error("AI plan error:", error);
        return NextResponse.json(
            { error: "Failed to plan website. Please try again." },
            { status: 500 }
        );
    }
}
