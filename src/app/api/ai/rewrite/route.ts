import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rewriteSection } from "@/lib/claude";
import { deductTokens, TOKEN_COSTS } from "@/lib/tokens";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section, instruction } = await req.json();

    if (!section || !instruction) {
        return NextResponse.json(
            { error: "Section and instruction are required" },
            { status: 400 }
        );
    }

    const { success, remaining } = await deductTokens(
        session.user.id,
        TOKEN_COSTS.REWRITE
    );

    if (!success) {
        return NextResponse.json(
            { error: "Not enough tokens", remaining },
            { status: 403 }
        );
    }

    try {
        const rewritten = await rewriteSection(section, instruction);
        return NextResponse.json({ section: rewritten, tokensRemaining: remaining });
    } catch (error) {
        console.error("AI rewrite error:", error);
        return NextResponse.json(
            { error: "Failed to rewrite section" },
            { status: 500 }
        );
    }
}
