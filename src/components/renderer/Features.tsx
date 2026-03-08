"use client";

import React from "react";

interface FeaturesProps {
    content: {
        layout?: string;
        title: string;
        subtitle: string;
        items: { icon: string; title: string; description: string }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function FeaturesRenderer({ content, theme, editMode, onUpdate }: FeaturesProps) {
    const layout = content.layout || "grid";

    // ─── Shared: Section header ───
    const SectionHeader = ({ align = "center" }: { align?: string }) => (
        <div style={{ textAlign: align as any, marginBottom: "72px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                ✦ Features
            </div>
            <h2
                style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, marginBottom: "16px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                onBlur={(e) => { if (onUpdate) onUpdate({ ...content, title: e.currentTarget.textContent || "" }); }}
            >
                {content.title}
            </h2>
            <p
                style={{ fontSize: "17px", color: "#64748b", maxWidth: align === "center" ? "560px" : "100%", margin: align === "center" ? "0 auto" : undefined, lineHeight: 1.7 }}
                contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                onBlur={(e) => { if (onUpdate) onUpdate({ ...content, subtitle: e.currentTarget.textContent || "" }); }}
            >
                {content.subtitle}
            </p>
        </div>
    );

    // ─── Layout: Alternating (Zigzag) ───
    if (layout === "alternating") {
        return (
            <section style={{ padding: "120px 24px", background: theme.backgroundColor || "#fff", position: "relative", overflow: "hidden" }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                    <SectionHeader align="center" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                        {content.items?.map((item, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "48px",
                                    flexDirection: i % 2 === 0 ? "row" : "row-reverse",
                                    flexWrap: "wrap",
                                }}
                            >
                                {/* Icon block */}
                                <div style={{
                                    flex: "0 0 120px", height: "120px", borderRadius: "24px",
                                    background: `linear-gradient(135deg, ${theme.primaryColor}12, ${theme.secondaryColor}08)`,
                                    border: `1px solid ${theme.primaryColor}10`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "48px",
                                }}>
                                    {item.icon}
                                </div>
                                {/* Text block */}
                                <div style={{ flex: 1, minWidth: "280px" }}>
                                    <h3
                                        style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px", color: theme.textColor, letterSpacing: "-0.01em" }}
                                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                                    >
                                        {item.title}
                                    </h3>
                                    <p
                                        style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.7 }}
                                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                                    >
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ─── Layout: List (vertical stack) ───
    if (layout === "list") {
        return (
            <section style={{ padding: "120px 24px", background: theme.backgroundColor || "#fff", position: "relative", overflow: "hidden" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                    <SectionHeader align="left" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                        {content.items?.map((item, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex", alignItems: "flex-start", gap: "20px",
                                    padding: "28px 0",
                                    borderBottom: i < (content.items?.length || 0) - 1 ? `1px solid ${theme.primaryColor}08` : "none",
                                    transition: "all 0.3s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "12px"; e.currentTarget.style.background = `${theme.primaryColor}03`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.background = "transparent"; }}
                            >
                                <div style={{
                                    flexShrink: 0, width: "44px", height: "44px", borderRadius: "12px",
                                    background: `${theme.primaryColor}08`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "22px", marginTop: "2px",
                                }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h3
                                        style={{ fontSize: "17px", fontWeight: 700, marginBottom: "6px", color: theme.textColor }}
                                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                                    >
                                        {item.title}
                                    </h3>
                                    <p
                                        style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7, maxWidth: "600px" }}
                                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                                    >
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ─── Layout: Grid (default) ───
    return (
        <section style={{ padding: "120px 24px", background: theme.backgroundColor || "#fff", position: "relative", overflow: "hidden" }}>
            {/* Subtle decorative gradient */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.primaryColor}06, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                <SectionHeader align="center" />

                {/* Feature cards grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                    {content.items?.map((item, i) => (
                        <div
                            key={i}
                            style={{
                                padding: "36px 32px", borderRadius: "20px",
                                border: `1px solid ${theme.primaryColor}10`,
                                background: `linear-gradient(165deg, ${theme.backgroundColor || '#fff'}, ${theme.primaryColor}03)`,
                                transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                cursor: "default", position: "relative", overflow: "hidden",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = `0 24px 48px ${theme.primaryColor}12`; e.currentTarget.style.borderColor = `${theme.primaryColor}25`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${theme.primaryColor}10`; }}
                        >
                            {/* Gradient icon container */}
                            <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor}10)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "24px", border: `1px solid ${theme.primaryColor}12` }}>
                                {item.icon}
                            </div>
                            <h3
                                style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px", color: theme.textColor, letterSpacing: "-0.01em" }}
                                contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                            >
                                {item.title}
                            </h3>
                            <p
                                style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7 }}
                                contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
