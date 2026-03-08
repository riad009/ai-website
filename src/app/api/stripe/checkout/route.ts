import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, TOKEN_PACKAGES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId } = await req.json();
    const pkg = TOKEN_PACKAGES.find((p) => p.id === packageId);

    if (!pkg) {
        return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `${pkg.name} - ${pkg.tokens} Tokens`,
                            description: pkg.description,
                        },
                        unit_amount: pkg.price,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: session.user.id,
                tokens: pkg.tokens.toString(),
                packageId: pkg.id,
            },
            success_url: `${process.env.NEXTAUTH_URL}/billing?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/billing?cancelled=true`,
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
