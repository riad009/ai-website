"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "./StoreProvider";

interface ProductGridProps {
    content: {
        title: string;
        subtitle: string;
        products: { name: string; price: string; image: string; description: string; badge?: string; category?: string }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function ProductGridRenderer({ content, theme, editMode, onUpdate }: ProductGridProps) {
    const store = useStore();
    const [sortBy, setSortBy] = useState("featured");
    const [localSearch, setLocalSearch] = useState("");

    const searchQuery = store?.searchQuery || localSearch;

    const filteredProducts = useMemo(() => {
        let products = content.products || [];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            products = products.filter((p) =>
                p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
            );
        }
        if (store?.selectedCategory && store.selectedCategory !== "all") {
            products = products.filter((p) => p.badge?.toLowerCase() === store.selectedCategory.toLowerCase());
        }
        if (sortBy === "price-low") {
            products = [...products].sort((a, b) => parseFloat(a.price.replace(/[^0-9.]/g, "")) - parseFloat(b.price.replace(/[^0-9.]/g, "")));
        } else if (sortBy === "price-high") {
            products = [...products].sort((a, b) => parseFloat(b.price.replace(/[^0-9.]/g, "")) - parseFloat(a.price.replace(/[^0-9.]/g, "")));
        } else if (sortBy === "name") {
            products = [...products].sort((a, b) => a.name.localeCompare(b.name));
        }
        return products;
    }, [content.products, searchQuery, store?.selectedCategory, sortBy]);

    const badges = useMemo(() => {
        const all = content.products?.map((p) => p.badge).filter(Boolean) || [];
        return ["All", ...Array.from(new Set(all))];
    }, [content.products]);

    const handleProductClick = (product: any) => {
        if (store) {
            store.setSelectedProduct({
                id: product.name.replace(/\s+/g, "-").toLowerCase(),
                name: product.name,
                price: product.price,
                priceNum: parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0,
                image: product.image,
                badge: product.badge,
                description: product.description,
                quantity: 1,
            });
            store.setProductDetailOpen(true);
        }
    };

    const handleAddToCart = (e: React.MouseEvent, product: any) => {
        e.stopPropagation();
        if (store) {
            store.addToCart({
                id: product.name.replace(/\s+/g, "-").toLowerCase(),
                name: product.name,
                price: product.price,
                priceNum: parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0,
                image: product.image,
                badge: product.badge,
                description: product.description,
            });
        }
    };

    return (
        <section id="product-search" style={{ padding: "100px 24px", background: theme.backgroundColor || "#fff", position: "relative", overflow: "hidden" }}>
            {/* Background radial */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.primaryColor}03, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        ✦ Shop
                    </div>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, marginBottom: "12px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                    >
                        {content.title}
                    </h2>
                    <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>{content.subtitle}</p>
                </div>

                {/* Search + Filter bar */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* Search input */}
                    <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
                        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={store?.searchQuery ?? localSearch}
                            onChange={(e) => {
                                if (store) store.setSearchQuery(e.target.value);
                                else setLocalSearch(e.target.value);
                            }}
                            style={{
                                width: "100%", padding: "14px 18px 14px 44px", borderRadius: "14px",
                                border: `1px solid ${theme.primaryColor}12`, fontSize: "14px",
                                fontFamily: "inherit", outline: "none", background: `${theme.primaryColor}03`,
                                transition: "border-color 0.3s, box-shadow 0.3s", boxSizing: "border-box",
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}40`; e.currentTarget.style.boxShadow = `0 0 0 4px ${theme.primaryColor}08`; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}12`; e.currentTarget.style.boxShadow = "none"; }}
                        />
                    </div>

                    {/* Sort dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: "14px 18px", borderRadius: "14px",
                            border: `1px solid ${theme.primaryColor}12`, fontSize: "14px",
                            fontFamily: "inherit", outline: "none", background: "#fff",
                            cursor: "pointer", color: theme.textColor, fontWeight: 500,
                        }}
                    >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low → High</option>
                        <option value="price-high">Price: High → Low</option>
                        <option value="name">Name: A → Z</option>
                    </select>
                </div>

                {/* Category pills */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
                    {badges.map((badge) => {
                        const isActive = (badge === "All" && (!store?.selectedCategory || store?.selectedCategory === "all")) ||
                            (store?.selectedCategory?.toLowerCase() === badge?.toLowerCase());
                        return (
                            <button
                                key={badge}
                                onClick={() => { if (store) store.setSelectedCategory(badge === "All" ? "all" : badge || "all"); }}
                                style={{
                                    padding: "8px 20px", borderRadius: "100px", fontSize: "13px", fontWeight: 600,
                                    border: isActive ? "none" : `1px solid ${theme.primaryColor}12`,
                                    background: isActive ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` : "#fff",
                                    color: isActive ? "#fff" : "#64748b",
                                    cursor: "pointer", transition: "all 0.2s",
                                    boxShadow: isActive ? `0 4px 12px ${theme.primaryColor}20` : "none",
                                }}
                            >
                                {badge}
                            </button>
                        );
                    })}
                </div>

                {/* Results count */}
                <div style={{ marginBottom: "20px", fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
                    Showing {filteredProducts.length} of {content.products?.length || 0} products
                </div>

                {/* Product Grid */}
                {filteredProducts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                        <h4 style={{ fontSize: "16px", fontWeight: 700, color: theme.textColor, marginBottom: "8px" }}>No products found</h4>
                        <p style={{ fontSize: "14px", color: "#94a3b8" }}>Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
                        {filteredProducts.map((product, i) => (
                            <div
                                key={i}
                                onClick={() => handleProductClick(product)}
                                style={{
                                    borderRadius: "20px", overflow: "hidden",
                                    border: `1px solid ${theme.primaryColor}08`,
                                    background: theme.backgroundColor || "#fff",
                                    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                    cursor: "pointer", position: "relative",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 20px 40px ${theme.primaryColor}10`; e.currentTarget.style.borderColor = `${theme.primaryColor}18`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${theme.primaryColor}08`; }}
                            >
                                {/* Image */}
                                <div style={{
                                    height: "220px", position: "relative", overflow: "hidden",
                                    background: `linear-gradient(135deg, ${theme.primaryColor}06, ${theme.secondaryColor}04)`,
                                }}>
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{ width: "100%", height: "100%", backgroundImage: `radial-gradient(${theme.primaryColor}08 1px, transparent 1px)`, backgroundSize: "16px 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
                                            🛍️
                                        </div>
                                    )}
                                    {product.badge && (
                                        <span style={{
                                            position: "absolute", top: "12px", left: "12px",
                                            padding: "5px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700,
                                            background: `linear-gradient(135deg, ${theme.accentColor || theme.primaryColor}, ${theme.secondaryColor})`,
                                            color: "#fff", textTransform: "uppercase", letterSpacing: "0.04em",
                                        }}>{product.badge}</span>
                                    )}
                                    {/* Wishlist button */}
                                    {store && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                store.toggleWishlist(product.name.replace(/\s+/g, "-").toLowerCase());
                                            }}
                                            style={{
                                                position: "absolute", top: "12px", right: "12px",
                                                width: "36px", height: "36px", borderRadius: "50%",
                                                background: "rgba(255,255,255,0.9)", border: "none",
                                                cursor: "pointer", fontSize: "16px", display: "flex",
                                                alignItems: "center", justifyContent: "center",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                            }}
                                        >
                                            {store.wishlist.includes(product.name.replace(/\s+/g, "-").toLowerCase()) ? "❤️" : "🤍"}
                                        </button>
                                    )}
                                    {/* Quick Add overlay */}
                                    <div style={{
                                        position: "absolute", bottom: "0", left: "0", right: "0",
                                        padding: "12px", background: "linear-gradient(transparent, rgba(0,0,0,0.5))",
                                        display: "flex", justifyContent: "center", opacity: 0,
                                        transition: "opacity 0.3s",
                                    }}
                                        className="quick-add-overlay"
                                    >
                                        <button onClick={(e) => handleAddToCart(e, product)} style={{
                                            padding: "10px 28px", borderRadius: "10px",
                                            background: "rgba(255,255,255,0.95)", border: "none",
                                            fontSize: "13px", fontWeight: 700, cursor: "pointer",
                                            color: theme.textColor, transition: "all 0.2s",
                                        }}>
                                            Quick Add +
                                        </button>
                                    </div>
                                </div>

                                {/* Details */}
                                <div style={{ padding: "20px" }}>
                                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: theme.textColor, marginBottom: "6px", letterSpacing: "-0.01em" }}>{product.name}</h3>
                                    <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {product.description}
                                    </p>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: "17px", fontWeight: 800, background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{product.price}</span>
                                        {store && (
                                            <button onClick={(e) => handleAddToCart(e, product)} style={{
                                                padding: "8px 18px", borderRadius: "10px",
                                                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                                                color: "#fff", border: "none", fontSize: "12px", fontWeight: 700,
                                                cursor: "pointer", transition: "all 0.2s",
                                                boxShadow: `0 2px 8px ${theme.primaryColor}15`,
                                            }}
                                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .quick-add-overlay:hover { opacity: 1 !important; }
                div:hover > div > .quick-add-overlay { opacity: 1 !important; }
            `}</style>
        </section>
    );
}
