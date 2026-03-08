"use client";

import React from "react";

interface TrustBadgesProps {
    content: {
        layout?: string;
        badges: { icon: string; title: string; description: string }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function TrustBadgesRenderer({ content, theme, editMode, onUpdate }: TrustBadgesProps) {
    const layout = content.layout || "horizontal";

    // ─── Layout: Vertical (stacked list) ───
    if (layout === "vertical") {
        return (
            <section style={{ padding: "48px 24px", background: `${theme.primaryColor}03`, borderTop: `1px solid ${theme.primaryColor}08`, borderBottom: `1px solid ${theme.primaryColor}08` }}>
                <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {content.badges?.map((badge, i) => (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", gap: "16px",
                            padding: "16px 20px", borderRadius: "12px",
                            background: theme.backgroundColor || "#fff",
                            border: `1px solid ${theme.primaryColor}08`,
                            transition: "all 0.3s",
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}18`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}08`; }}
                        >
                            <span style={{ fontSize: "24px", flexShrink: 0 }}>{badge.icon}</span>
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: theme.textColor, marginBottom: "2px" }}>{badge.title}</div>
                                <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 }}>{badge.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // ─── Layout: Inline (compact text-only) ───
    if (layout === "inline") {
        return (
            <section style={{ padding: "24px", background: `linear-gradient(135deg, ${theme.primaryColor}06, ${theme.secondaryColor}04)`, borderTop: `1px solid ${theme.primaryColor}06`, borderBottom: `1px solid ${theme.primaryColor}06` }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
                    {content.badges?.map((badge, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                            <span style={{ fontSize: "16px" }}>{badge.icon}</span>
                            <span style={{ fontWeight: 600, color: theme.textColor }}>{badge.title}</span>
                            <span>·</span>
                            <span>{badge.description}</span>
                        </span>
                    ))}
                </div>
            </section>
        );
    }

    // ─── Layout: Horizontal (default — card row) ───
    return (
        <section style={{ padding: "48px 24px", background: theme.backgroundColor || "#fff", borderTop: `1px solid ${theme.primaryColor}08`, borderBottom: `1px solid ${theme.primaryColor}08` }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: `repeat(${Math.min(content.badges?.length || 4, 4)}, 1fr)`, gap: "20px" }}>
                {content.badges?.map((badge, i) => (
                    <div key={i} style={{
                        display: "flex", alignItems: "center", gap: "16px",
                        padding: "20px 24px", borderRadius: "16px",
                        border: `1px solid ${theme.primaryColor}08`,
                        background: `linear-gradient(165deg, ${theme.backgroundColor || '#fff'}, ${theme.primaryColor}03)`,
                        transition: "all 0.3s",
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}18`; e.currentTarget.style.boxShadow = `0 8px 24px ${theme.primaryColor}06`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}08`; e.currentTarget.style.boxShadow = "none"; }}
                    >
                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `linear-gradient(135deg, ${theme.primaryColor}12, ${theme.secondaryColor}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                            {badge.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: theme.textColor, marginBottom: "2px", letterSpacing: "-0.01em" }}>{badge.title}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500, lineHeight: 1.4 }}>{badge.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
