"use client";

import React, { useState } from "react";
import { useStore } from "./StoreProvider";

export default function CheckoutModal({ theme }: { theme: any }) {
    const store = useStore();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [shippingData, setShippingData] = useState({ name: "", email: "", address: "", city: "", zip: "", phone: "" });

    if (!store || !store.checkoutOpen) return null;

    const shipping = store.cartTotal >= 75 ? 0 : 9.99;
    const tax = store.cartTotal * 0.08;
    const total = store.cartTotal + shipping + tax;

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "14px 18px", borderRadius: "12px",
        border: `1px solid ${theme.primaryColor}12`, fontSize: "14px",
        fontFamily: "inherit", outline: "none", background: `${theme.primaryColor}03`,
        transition: "border-color 0.3s, box-shadow 0.3s", boxSizing: "border-box",
    };

    const steps = [
        { num: 1, label: "Shipping" },
        { num: 2, label: "Payment" },
        { num: 3, label: "Review" },
    ];

    return (
        <>
            <div onClick={() => store.setCheckoutOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", zIndex: 9998 }} />

            <div style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: "680px", maxWidth: "92vw", maxHeight: "90vh", overflow: "auto",
                background: "#fff", borderRadius: "24px", zIndex: 9999,
                boxShadow: "0 24px 64px rgba(0,0,0,0.2)", animation: "scaleIn 0.3s ease",
            }}>
                {/* Header */}
                <div style={{ padding: "32px 36px 24px", borderBottom: `1px solid ${theme.primaryColor}08` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "22px", fontWeight: 800, color: theme.textColor }}>Checkout</h2>
                        <button onClick={() => store.setCheckoutOpen(false)} style={{ background: `${theme.primaryColor}08`, border: "none", width: "36px", height: "36px", borderRadius: "10px", fontSize: "18px", cursor: "pointer" }}>×</button>
                    </div>

                    {/* Step indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                        {steps.map((s, i) => (
                            <React.Fragment key={s.num}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{
                                        width: "32px", height: "32px", borderRadius: "50%",
                                        background: step >= s.num ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` : `${theme.primaryColor}10`,
                                        color: step >= s.num ? "#fff" : "#94a3b8",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "13px", fontWeight: 700,
                                    }}>{step > s.num ? "✓" : s.num}</div>
                                    <span style={{ fontSize: "13px", fontWeight: step === s.num ? 700 : 500, color: step === s.num ? theme.textColor : "#94a3b8" }}>{s.label}</span>
                                </div>
                                {i < 2 && <div style={{ flex: 1, height: "2px", background: step > s.num ? theme.primaryColor : `${theme.primaryColor}10`, margin: "0 16px" }} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: "28px 36px" }}>
                    {step === 1 && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>Full Name</label>
                                <input value={shippingData.name} onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })} placeholder="John Doe" style={inputStyle} />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>Email</label>
                                <input type="email" value={shippingData.email} onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })} placeholder="you@example.com" style={inputStyle} />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>Address</label>
                                <input value={shippingData.address} onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })} placeholder="123 Main Street, Apt 4" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>City</label>
                                <input value={shippingData.city} onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })} placeholder="New York" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>ZIP Code</label>
                                <input value={shippingData.zip} onChange={(e) => setShippingData({ ...shippingData, zip: e.target.value })} placeholder="10001" style={inputStyle} />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>Phone</label>
                                <input value={shippingData.phone} onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })} placeholder="+1 (555) 000-0000" style={inputStyle} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>Card Number</label>
                                <input placeholder="4242 4242 4242 4242" style={inputStyle} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>Expiry</label>
                                    <input placeholder="MM/YY" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>CVC</label>
                                    <input placeholder="123" style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>Name on Card</label>
                                <input placeholder="JOHN DOE" style={inputStyle} />
                            </div>
                            <div style={{ display: "flex", gap: "10px", padding: "16px", borderRadius: "14px", background: `${theme.primaryColor}04`, border: `1px solid ${theme.primaryColor}10` }}>
                                <span style={{ fontSize: "18px" }}>🔒</span>
                                <div>
                                    <div style={{ fontSize: "13px", fontWeight: 600, color: theme.textColor }}>Secure Payment</div>
                                    <div style={{ fontSize: "12px", color: "#64748b" }}>Your payment information is encrypted with 256-bit SSL</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h4 style={{ fontSize: "15px", fontWeight: 700, color: theme.textColor, marginBottom: "16px" }}>Order Summary</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                                {store.cart.map((item) => (
                                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "12px", background: `${theme.primaryColor}03` }}>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 600, color: theme.textColor }}>{item.name}</div>
                                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Qty: {item.quantity}</div>
                                        </div>
                                        <span style={{ fontSize: "14px", fontWeight: 700, color: theme.textColor }}>${(item.priceNum * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: `1px solid ${theme.primaryColor}08`, paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b" }}>
                                    <span>Subtotal</span><span>${store.cartTotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b" }}>
                                    <span>Shipping</span><span style={{ color: shipping === 0 ? "#22c55e" : undefined }}>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b" }}>
                                    <span>Tax</span><span>${tax.toFixed(2)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 800, color: theme.textColor, paddingTop: "12px", borderTop: `1px solid ${theme.primaryColor}08` }}>
                                    <span>Total</span><span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {shippingData.address && (
                                <div style={{ marginTop: "20px", padding: "16px", borderRadius: "14px", background: `${theme.primaryColor}04` }}>
                                    <div style={{ fontSize: "13px", fontWeight: 600, color: theme.textColor, marginBottom: "4px" }}>Shipping to:</div>
                                    <div style={{ fontSize: "13px", color: "#64748b" }}>{shippingData.name}, {shippingData.address}, {shippingData.city} {shippingData.zip}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: "0 36px 32px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    {step > 1 && (
                        <button onClick={() => setStep((step - 1) as 1 | 2)} style={{
                            padding: "14px 28px", borderRadius: "12px", border: `1px solid ${theme.primaryColor}15`,
                            background: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", color: theme.textColor,
                        }}>Back</button>
                    )}
                    {step < 3 ? (
                        <button onClick={() => setStep((step + 1) as 2 | 3)} style={{
                            padding: "14px 36px", borderRadius: "12px",
                            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                            color: "#fff", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer",
                            boxShadow: `0 8px 24px ${theme.primaryColor}25`, transition: "all 0.3s",
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            {step === 1 ? "Continue to Payment" : "Review Order"}
                        </button>
                    ) : (
                        <button onClick={() => store.placeOrder()} style={{
                            padding: "14px 36px", borderRadius: "12px",
                            background: `linear-gradient(135deg, #22c55e, #10b981)`,
                            color: "#fff", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer",
                            boxShadow: "0 8px 24px rgba(34,197,94,0.25)", transition: "all 0.3s",
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            Place Order — ${total.toFixed(2)}
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
            `}</style>
        </>
    );
}
