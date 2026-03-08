import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateQuestions } from "@/lib/claude";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    try {
        const questions = await generateQuestions(prompt);
        return NextResponse.json({ questions });
    } catch (error) {
        console.error("AI questions error:", error);
        return NextResponse.json(
            { error: "Failed to generate questions. Please try again." },
            { status: 500 }
        );
    }
}
