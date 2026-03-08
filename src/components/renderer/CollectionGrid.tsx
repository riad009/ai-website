"use client";

import React from "react";

interface CollectionGridProps {
    content: {
        title: string;
        subtitle: string;
        collections: { name: string; image: string; itemCount: string; href: string }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function CollectionGridRenderer({ content, theme, editMode, onUpdate }: CollectionGridProps) {
    return (
        <section style={{ padding: "100px 24px", background: theme.backgroundColor || "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "56px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        ✦ Collections
                    </div>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, marginBottom: "12px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                    >
                        {content.title}
                    </h2>
                    <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
                        {content.subtitle}
                    </p>
                </div>

                {/* Collections layout — first two large, rest smaller */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto", gap: "16px" }}>
                    {content.collections?.map((col, i) => {
                        const isLarge = i < 2;
                        return (
                            <a
                                key={i}
                                href={col.href || "#"}
                                style={{
                                    position: "relative",
                                    borderRadius: "20px",
                                    overflow: "hidden",
                                    height: isLarge ? "340px" : "220px",
                                    gridColumn: !isLarge && content.collections.length > 4 ? "auto" : undefined,
                                    display: "flex",
                                    alignItems: "flex-end",
                                    textDecoration: "none",
                                    background: col.image
                                        ? `url(${col.image}) center/cover`
                                        : `linear-gradient(160deg, ${theme.primaryColor}${15 + i * 5}, ${theme.secondaryColor}${10 + i * 5}, ${theme.accentColor || theme.primaryColor}${5 + i * 3})`,
                                    transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                            >
                                {/* Dot pattern overlay for gradient-only cards */}
                                {!col.image && (
                                    <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${theme.primaryColor}10 1px, transparent 1px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
                                )}

                                {/* Bottom gradient overlay */}
                                <div style={{
                                    position: "absolute", inset: 0,
                                    background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)",
                                    pointerEvents: "none",
                                }} />

                                {/* Content */}
                                <div style={{ position: "relative", zIndex: 1, padding: "28px", width: "100%" }}>
                                    <h3 style={{ fontSize: isLarge ? "24px" : "18px", fontWeight: 700, color: "#fff", marginBottom: "4px", letterSpacing: "-0.01em" }}>
                                        {col.name}
                                    </h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                                            {col.itemCount}
                                        </span>
                                        <span style={{
                                            display: "inline-flex", alignItems: "center", gap: "6px",
                                            padding: "8px 18px", borderRadius: "10px",
                                            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
                                            color: "#fff", fontSize: "12px", fontWeight: 600,
                                            border: "1px solid rgba(255,255,255,0.2)",
                                            transition: "background 0.3s",
                                        }}>
                                            Shop Now →
                                        </span>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
