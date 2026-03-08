"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Payment {
    id: string;
    amount: number;
    tokens: number;
    status: string;
    createdAt: string;
}

const PACKAGES = [
    { id: "starter", name: "Starter Pack", tokens: 50, price: "$5", description: "Perfect for trying out", popular: false, features: ["50 AI tokens", "~10 website generations", "All features included"] },
    { id: "pro", name: "Pro Pack", tokens: 200, price: "$15", description: "Best value for creators", popular: true, features: ["200 AI tokens", "~40 website generations", "Priority support", "All features included"] },
    { id: "business", name: "Business Pack", tokens: 500, price: "$30", description: "For agencies & teams", popular: false, features: ["500 AI tokens", "~100 website generations", "Priority support", "All features included"] },
];

export default function BillingPage() {
    return (
        <Suspense fallback={<DashboardLayout><div className="empty-state"><div className="spinner" style={{ margin: "0 auto" }} /></div></DashboardLayout>}>
            <BillingContent />
        </Suspense>
    );
}

function BillingContent() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [liveTokens, setLiveTokens] = useState<number | null>(null);

    const success = searchParams.get("success");
    const cancelled = searchParams.get("cancelled");

    const fetchTokens = async () => {
        try {
            const res = await fetch("/api/user/tokens");
            if (res.ok) {
                const data = await res.json();
                if (data.tokens !== undefined) setLiveTokens(data.tokens);
            }
        } catch { }
    };

    useEffect(() => {
        fetchPayments();
        fetchTokens();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await fetch("/api/payments");
            if (res.ok) {
                setPayments(await res.json());
            }
        } finally {
            setLoadingPayments(false);
        }
    };

    const handlePurchase = async (packageId: string) => {
        setPurchasing(packageId);
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ packageId }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                }
            } else {
                alert("Failed to create checkout session");
            }
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Billing & Tokens</h1>
                    <p className="page-subtitle">Buy tokens to power your AI website generation</p>
                </div>
                <div className="token-badge">
                    <span className="icon">🪙</span>
                    {liveTokens ?? (session?.user as any)?.tokens ?? 0} tokens remaining
                </div>
            </div>

            {success && (
                <div className="success-message" style={{ marginBottom: "24px" }}>
                    ✅ Payment successful! Your tokens have been added.
                </div>
            )}
            {cancelled && (
                <div className="error-message" style={{ marginBottom: "24px" }}>
                    Payment was cancelled. No tokens were added.
                </div>
            )}

            <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>Token Packages</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
                Generate: 5 tokens · Rewrite: 2 tokens · Improve: 1 token
            </p>

            <div className="pricing-grid" style={{ marginBottom: "48px" }}>
                {PACKAGES.map((pkg) => (
                    <div key={pkg.id} className={`pricing-card ${pkg.popular ? "popular" : ""}`}>
                        {pkg.popular && <div className="popular-badge">Most Popular</div>}
                        <div className="pricing-name">{pkg.name}</div>
                        <div className="pricing-tokens">
                            {pkg.tokens} <span>tokens</span>
                        </div>
                        <div className="pricing-price">{pkg.price}</div>
                        <ul className="pricing-features">
                            {pkg.features.map((f, i) => (
                                <li key={i}>{f}</li>
                            ))}
                        </ul>
                        <button
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                            onClick={() => handlePurchase(pkg.id)}
                            disabled={purchasing !== null}
                        >
                            {purchasing === pkg.id ? (
                                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing...</>
                            ) : (
                                `Buy for ${pkg.price}`
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>Payment History</h2>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Tokens</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                    No payments yet
                                </td>
                            </tr>
                        ) : (
                            payments.map((pmt) => (
                                <tr key={pmt.id}>
                                    <td>{new Date(pmt.createdAt).toLocaleDateString()}</td>
                                    <td>+{pmt.tokens} tokens</td>
                                    <td>${(pmt.amount / 100).toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge status-${pmt.status.toLowerCase()}`}>
                                            {pmt.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
