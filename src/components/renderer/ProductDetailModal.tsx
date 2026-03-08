"use client";

import React, { useState } from "react";
import { useStore } from "./StoreProvider";

export default function ProductDetailModal({ theme }: { theme: any }) {
    const store = useStore();
    const [qty, setQty] = useState(1);
    const [selectedTab, setSelectedTab] = useState<"description" | "reviews" | "shipping">("description");

    if (!store || !store.productDetailOpen || !store.selectedProduct) return null;
    const product = store.selectedProduct;

    return (
        <>
            <div onClick={() => store.setProductDetailOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", zIndex: 9998, animation: "fadeIn 0.2s ease" }} />

            <div style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: "800px", maxWidth: "92vw", maxHeight: "85vh", overflow: "auto",
                background: "#fff", borderRadius: "24px", zIndex: 9999,
                animation: "scaleIn 0.3s ease", boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}>
                <button onClick={() => store.setProductDetailOpen(false)} style={{
                    position: "absolute", top: "16px", right: "16px", width: "36px", height: "36px",
                    borderRadius: "10px", background: "rgba(255,255,255,0.9)", border: "none",
                    cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}>×</button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
                    {/* Product Image */}
                    <div style={{
                        padding: "48px", display: "flex", alignItems: "center", justifyContent: "center",
                        background: `linear-gradient(135deg, ${theme.primaryColor}06, ${theme.secondaryColor}04)`,
                        borderRadius: "24px 0 0 24px", minHeight: "400px", position: "relative",
                    }}>
                        {product.badge && (
                            <span style={{
                                position: "absolute", top: "20px", left: "20px",
                                padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 700,
                                background: `linear-gradient(135deg, ${theme.accentColor || theme.primaryColor}, ${theme.secondaryColor})`,
                                color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>{product.badge}</span>
                        )}
                        <div style={{
                            width: "100%", aspectRatio: "1", borderRadius: "20px",
                            backgroundImage: `radial-gradient(${theme.primaryColor}08 1px, transparent 1px)`,
                            backgroundSize: "20px 20px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "80px",
                        }}>
                            {product.image ? <img src={product.image} alt="" style={{ width: "100%", borderRadius: "20px" }} /> : "🛍️"}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column" }}>
                        <h2 style={{ fontSize: "26px", fontWeight: 800, color: theme.textColor, marginBottom: "8px", letterSpacing: "-0.02em" }}>{product.name}</h2>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <span style={{ fontSize: "28px", fontWeight: 800, background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{product.price}</span>
                            <div style={{ display: "flex", gap: "2px" }}>
                                {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ color: "#fbbf24", fontSize: "14px" }}>★</span>)}
                            </div>
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>(128 reviews)</span>
                        </div>

                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.8, marginBottom: "24px" }}>{product.description}</p>

                        {/* Tabs */}
                        <div style={{ display: "flex", gap: "0", marginBottom: "16px", borderBottom: `1px solid ${theme.primaryColor}08` }}>
                            {(["description", "reviews", "shipping"] as const).map((tab) => (
                                <button key={tab} onClick={() => setSelectedTab(tab)} style={{
                                    padding: "10px 16px", background: "none", border: "none",
                                    borderBottom: selectedTab === tab ? `2px solid ${theme.primaryColor}` : "2px solid transparent",
                                    color: selectedTab === tab ? theme.primaryColor : "#94a3b8",
                                    fontSize: "13px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                                }}>{tab}</button>
                            ))}
                        </div>

                        <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.8, marginBottom: "24px", minHeight: "60px" }}>
                            {selectedTab === "description" && <p>{product.description}</p>}
                            {selectedTab === "reviews" && (
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                        <strong style={{ color: theme.textColor }}>Jennifer S.</strong>
                                        <span style={{ color: "#fbbf24" }}>★★★★★</span>
                                    </div>
                                    <p>"Absolutely love this! Quality is amazing and shipped fast. Would definitely recommend to anyone."</p>
                                </div>
                            )}
                            {selectedTab === "shipping" && <p>Free standard shipping on orders over $75. Express shipping available for $12.99. Estimated delivery: 3-5 business days. 30-day hassle-free returns.</p>}
                        </div>

                        {/* Quantity + Add to Cart */}
                        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: theme.textColor }}>Quantity</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0", borderRadius: "12px", border: `1px solid ${theme.primaryColor}12`, overflow: "hidden" }}>
                                    <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: "40px", height: "40px", border: "none", background: `${theme.primaryColor}04`, cursor: "pointer", fontSize: "16px" }}>−</button>
                                    <span style={{ width: "48px", textAlign: "center", fontSize: "14px", fontWeight: 700 }}>{qty}</span>
                                    <button onClick={() => setQty(qty + 1)} style={{ width: "40px", height: "40px", border: "none", background: `${theme.primaryColor}04`, cursor: "pointer", fontSize: "16px" }}>+</button>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button onClick={() => {
                                    for (let i = 0; i < qty; i++) store.addToCart(product);
                                    store.setProductDetailOpen(false);
                                }} style={{
                                    flex: 1, padding: "16px", borderRadius: "14px",
                                    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                                    color: "#fff", border: "none", fontSize: "15px", fontWeight: 700, cursor: "pointer",
                                    boxShadow: `0 8px 24px ${theme.primaryColor}25`, transition: "all 0.3s",
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                                >
                                    Add to Cart
                                </button>
                                <button onClick={() => store.toggleWishlist(product.id)} style={{
                                    width: "52px", borderRadius: "14px",
                                    border: `1px solid ${theme.primaryColor}15`,
                                    background: store.wishlist.includes(product.id) ? `${theme.accentColor || '#f43f5e'}10` : "#fff",
                                    cursor: "pointer", fontSize: "20px", transition: "all 0.2s",
                                }}>
                                    {store.wishlist.includes(product.id) ? "❤️" : "🤍"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
            `}</style>
        </>
    );
}
