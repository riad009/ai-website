import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { addTokens } from "@/lib/tokens";
import { pool, generateId } from "@/lib/db";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    // If webhook secret is not set, just parse the event directly
    let event;
    try {
        if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
            event = stripe.webhooks.constructEvent(
                body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } else {
            event = JSON.parse(body);
        }
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tokens = parseInt(session.metadata?.tokens || "0");

        if (userId && tokens > 0) {
            // Add tokens
            await addTokens(userId, tokens);

            // Record payment
            const paymentId = generateId();
            await pool.query(
                'INSERT INTO "Payment" (id, "userId", amount, tokens, "stripeSessionId", status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
                [paymentId, userId, session.amount_total || 0, tokens, session.id, "COMPLETED"]
            );
        }
    }

    return NextResponse.json({ received: true });
}
