import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSection, type SitePlan } from "@/lib/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, section, model } = await req.json();

    if (!plan || !section?.id) {
        return NextResponse.json({ error: "plan and section are required" }, { status: 400 });
    }

    try {
        const result = await generateSection(plan as SitePlan, section, model);
        return NextResponse.json({ section: result });
    } catch (error) {
        console.error("AI section error:", error);
        return NextResponse.json(
            { error: `Failed to build section ${section.label || section.id}.` },
            { status: 500 }
        );
    }
}
