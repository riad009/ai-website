"use client";

import React from "react";
import { useStore } from "./StoreProvider";

export default function CartDrawer({ theme }: { theme: any }) {
    const store = useStore();
    if (!store || !store.cartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div onClick={() => store.setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 9998, animation: "fadeIn 0.2s ease" }} />

            {/* Drawer */}
            <div style={{
                position: "fixed", top: 0, right: 0, bottom: 0, width: "420px", maxWidth: "90vw",
                background: "#fff", zIndex: 9999, display: "flex", flexDirection: "column",
                boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", animation: "slideInRight 0.3s ease",
            }}>
                {/* Header */}
                <div style={{ padding: "24px 28px", borderBottom: `1px solid ${theme.primaryColor}10`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ fontSize: "18px", fontWeight: 800, color: theme.textColor, marginBottom: "2px" }}>Shopping Cart</h3>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>{store.cartCount} {store.cartCount === 1 ? "item" : "items"}</span>
                    </div>
                    <button onClick={() => store.setCartOpen(false)} style={{ background: `${theme.primaryColor}08`, border: "none", width: "36px", height: "36px", borderRadius: "10px", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = `${theme.primaryColor}15`}
                        onMouseLeave={(e) => e.currentTarget.style.background = `${theme.primaryColor}08`}
                    >×</button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>
                    {store.cart.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px" }}>
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛒</div>
                            <h4 style={{ fontSize: "16px", fontWeight: 700, color: theme.textColor, marginBottom: "8px" }}>Your cart is empty</h4>
                            <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "24px" }}>Browse our collection and add items you love</p>
                            <button onClick={() => store.setCartOpen(false)} style={{
                                padding: "14px 32px", borderRadius: "12px",
                                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                                color: "#fff", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer",
                            }}>Continue Shopping</button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {store.cart.map((item) => (
                                <div key={item.id} style={{
                                    display: "flex", gap: "16px", padding: "16px", borderRadius: "16px",
                                    border: `1px solid ${theme.primaryColor}08`, background: `${theme.primaryColor}02`,
                                }}>
                                    <div style={{
                                        width: "72px", height: "72px", borderRadius: "12px", flexShrink: 0,
                                        background: `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}08)`,
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px",
                                    }}>
                                        {item.image ? <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} /> : "🛍️"}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: "14px", fontWeight: 700, color: theme.textColor, marginBottom: "4px" }}>{item.name}</h4>
                                        <div style={{ fontSize: "14px", fontWeight: 700, color: theme.secondaryColor, marginBottom: "10px" }}>{item.price}</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <button onClick={() => store.updateQuantity(item.id, item.quantity - 1)} style={{ width: "28px", height: "28px", borderRadius: "8px", border: `1px solid ${theme.primaryColor}15`, background: "#fff", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                            <span style={{ fontSize: "14px", fontWeight: 600, minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                                            <button onClick={() => store.updateQuantity(item.id, item.quantity + 1)} style={{ width: "28px", height: "28px", borderRadius: "8px", border: `1px solid ${theme.primaryColor}15`, background: "#fff", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                                            <button onClick={() => store.removeFromCart(item.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>Remove</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {store.cart.length > 0 && (
                    <div style={{ padding: "24px 28px", borderTop: `1px solid ${theme.primaryColor}10` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontSize: "14px", color: "#64748b" }}>Subtotal</span>
                            <span style={{ fontSize: "16px", fontWeight: 800, color: theme.textColor }}>${store.cartTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <span style={{ fontSize: "13px", color: "#94a3b8" }}>Shipping</span>
                            <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: 600 }}>{store.cartTotal >= 75 ? "FREE" : "$9.99"}</span>
                        </div>
                        <button onClick={() => { store.setCartOpen(false); store.setCheckoutOpen(true); }} style={{
                            width: "100%", padding: "16px", borderRadius: "14px",
                            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                            color: "#fff", border: "none", fontSize: "15px", fontWeight: 700, cursor: "pointer",
                            boxShadow: `0 8px 24px ${theme.primaryColor}25`, transition: "all 0.3s",
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${theme.primaryColor}40`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 8px 24px ${theme.primaryColor}25`; }}
                        >
                            Checkout — ${(store.cartTotal + (store.cartTotal >= 75 ? 0 : 9.99)).toFixed(2)}
                        </button>
                        <button onClick={() => store.clearCart()} style={{ width: "100%", padding: "12px", marginTop: "8px", background: "none", border: "none", color: "#94a3b8", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </>
    );
}
