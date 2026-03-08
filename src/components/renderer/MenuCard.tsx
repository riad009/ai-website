"use client";

import React from "react";

interface MenuCardProps {
    content: {
        title: string;
        subtitle: string;
        categories: {
            name: string;
            items: { name: string; description: string; price: string; image: string }[];
        }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function MenuCardRenderer({ content, theme, editMode, onUpdate }: MenuCardProps) {
    return (
        <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${theme.backgroundColor || '#fff'}, ${theme.primaryColor}04)`, position: "relative" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "72px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        ✦ Menu
                    </div>
                    <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, marginBottom: "16px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{content.title}</h2>
                    <p style={{ fontSize: "17px", color: "#64748b", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>{content.subtitle}</p>
                </div>

                {/* Categories */}
                {content.categories?.map((cat, i) => (
                    <div key={i} style={{ marginBottom: "52px" }}>
                        {/* Category header with gradient underline */}
                        <div style={{ marginBottom: "24px", paddingBottom: "16px", position: "relative" }}>
                            <h3 style={{ fontSize: "22px", fontWeight: 700, color: theme.textColor, letterSpacing: "-0.01em" }}>{cat.name}</h3>
                            <div style={{
                                position: "absolute", bottom: 0, left: 0, width: "60px", height: "3px",
                                borderRadius: "3px",
                                background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                            }} />
                        </div>

                        {/* Items */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {cat.items?.map((item, j) => (
                                <div key={j} style={{
                                    display: "flex", alignItems: "center", gap: "20px",
                                    padding: "20px", borderRadius: "16px",
                                    border: `1px solid ${theme.primaryColor}08`,
                                    background: theme.backgroundColor || "#fff",
                                    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = `${theme.primaryColor}18`;
                                        e.currentTarget.style.boxShadow = `0 8px 24px ${theme.primaryColor}08`;
                                        e.currentTarget.style.transform = "translateX(4px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = `${theme.primaryColor}08`;
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.transform = "translateX(0)";
                                    }}
                                >
                                    {/* Image / placeholder */}
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} style={{ width: "64px", height: "64px", borderRadius: "14px", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{
                                            width: "64px", height: "64px", borderRadius: "14px",
                                            background: `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}08)`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "26px", flexShrink: 0,
                                            border: `1px solid ${theme.primaryColor}10`,
                                        }}>
                                            🍽️
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: "16px", fontWeight: 700, color: theme.textColor, marginBottom: "4px", letterSpacing: "-0.01em" }}>{item.name}</h4>
                                        <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>{item.description}</p>
                                    </div>
                                    <div style={{
                                        fontSize: "17px", fontWeight: 800, whiteSpace: "nowrap",
                                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                                    }}>
                                        {item.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
