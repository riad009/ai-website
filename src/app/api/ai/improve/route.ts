import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { improveContent } from "@/lib/claude";
import { deductTokens, TOKEN_COSTS } from "@/lib/tokens";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section } = await req.json();

    if (!section) {
        return NextResponse.json(
            { error: "Section is required" },
            { status: 400 }
        );
    }

    const { success, remaining } = await deductTokens(
        session.user.id,
        TOKEN_COSTS.IMPROVE
    );

    if (!success) {
        return NextResponse.json(
            { error: "Not enough tokens", remaining },
            { status: 403 }
        );
    }

    try {
        const improved = await improveContent(section);
        return NextResponse.json({ section: improved, tokensRemaining: remaining });
    } catch (error) {
        console.error("AI improve error:", error);
        return NextResponse.json(
            { error: "Failed to improve content" },
            { status: 500 }
        );
    }
}
