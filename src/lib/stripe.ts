import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia" as any,
});

export const TOKEN_PACKAGES = [
    {
        id: "starter",
        name: "Starter Pack",
        tokens: 50,
        price: 500, // $5.00 in cents
        priceDisplay: "$5",
        description: "Perfect for trying out",
        popular: false,
    },
    {
        id: "pro",
        name: "Pro Pack",
        tokens: 200,
        price: 1500, // $15.00
        priceDisplay: "$15",
        description: "Best value for creators",
        popular: true,
    },
    {
        id: "business",
        name: "Business Pack",
        tokens: 500,
        price: 3000, // $30.00
        priceDisplay: "$30",
        description: "For agencies & teams",
        popular: false,
    },
];
