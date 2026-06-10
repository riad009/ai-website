import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { generateWebsiteStream, type ProgressEvent } from "@/lib/claude";
import { deductTokens, TOKEN_COSTS } from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120; // Allow up to 2 minutes for streaming

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { prompt, category, answers, model, designBrief } = await req.json();

    if (!prompt) {
        return new Response(JSON.stringify({ error: "Prompt is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const resolvedCategory = category || "auto";

    // Deduct tokens
    const { success, remaining } = await deductTokens(
        session.user.id,
        TOKEN_COSTS.GENERATE
    );

    if (!success) {
        return new Response(
            JSON.stringify({ error: "Not enough tokens. Please purchase more.", remaining }),
            { status: 403, headers: { "Content-Type": "application/json" } }
        );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (type: string, data: unknown) => {
                try {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type, ...data as object })}\n\n`)
                    );
                } catch {
                    // Controller may be closed
                }
            };

            try {
                const onProgress = (event: ProgressEvent) => {
                    sendEvent("progress", event);
                };

                const website = await generateWebsiteStream(
                    prompt,
                    resolvedCategory,
                    answers,
                    model,
                    onProgress,
                    designBrief
                );

                sendEvent("complete", { website, tokensRemaining: remaining });
            } catch (error) {
                const errMsg = error instanceof Error ? error.message : "Unknown error";
                console.error("AI streaming generation error:", errMsg);
                sendEvent("error", {
                    error: `Generation failed: ${errMsg}`,
                });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
