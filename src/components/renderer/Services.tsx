"use client";

import React from "react";

interface ServicesProps {
    content: {
        layout?: string;
        title: string;
        subtitle: string;
        items: { icon: string; title: string; description: string; price: string }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function ServicesRenderer({ content, theme, editMode, onUpdate }: ServicesProps) {
    const layout = content.layout || "grid";

    // ─── Shared: Section header ───
    const SectionHeader = ({ align = "center" }: { align?: string }) => (
        <div style={{ textAlign: align as any, marginBottom: "72px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                ✦ Services
            </div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, marginBottom: "16px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                contentEditable={editMode} suppressContentEditableWarning data-editable="true"
            >
                {content.title}
            </h2>
            <p style={{ fontSize: "17px", color: "#64748b", maxWidth: align === "center" ? "560px" : "100%", margin: align === "center" ? "0 auto" : undefined, lineHeight: 1.7 }}>
                {content.subtitle}
            </p>
        </div>
    );

    // ─── Layout: List (horizontal rows) ───
    if (layout === "list") {
        return (
            <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${theme.primaryColor}04, ${theme.backgroundColor || '#fff'})`, position: "relative" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <SectionHeader align="left" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                        {content.items?.map((item, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: "24px",
                                padding: "28px 0",
                                borderBottom: `1px solid ${theme.primaryColor}08`,
                                transition: "all 0.3s",
                                flexWrap: "wrap",
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "16px"; e.currentTarget.style.background = `${theme.primaryColor}03`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.background = "transparent"; }}
                            >
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `linear-gradient(135deg, ${theme.primaryColor}12, ${theme.secondaryColor}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                                    {item.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: "200px" }}>
                                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: theme.textColor, marginBottom: "4px" }} contentEditable={editMode} suppressContentEditableWarning data-editable="true">
                                        {item.title}
                                    </h3>
                                    <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }} contentEditable={editMode} suppressContentEditableWarning data-editable="true">
                                        {item.description}
                                    </p>
                                </div>
                                {item.price && (
                                    <div style={{ fontSize: "16px", fontWeight: 700, color: theme.primaryColor, flexShrink: 0, padding: "8px 20px", borderRadius: "10px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}12` }}>
                                        {item.price}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ─── Layout: Numbered (steps) ───
    if (layout === "numbered") {
        return (
            <section style={{ padding: "120px 24px", background: theme.backgroundColor || "#fff", position: "relative" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <SectionHeader align="center" />
                    <div style={{ position: "relative" }}>
                        {/* Connecting vertical line */}
                        <div style={{ position: "absolute", left: "28px", top: "0", bottom: "0", width: "2px", background: `linear-gradient(180deg, ${theme.primaryColor}20, ${theme.secondaryColor}10, transparent)` }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                            {content.items?.map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "28px", position: "relative" }}>
                                    {/* Step number */}
                                    <div style={{
                                        width: "56px", height: "56px", borderRadius: "50%", flexShrink: 0,
                                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "20px", fontWeight: 800, color: "#fff",
                                        boxShadow: `0 4px 16px ${theme.primaryColor}25`,
                                        position: "relative", zIndex: 1,
                                    }}>
                                        {i + 1}
                                    </div>
                                    {/* Content */}
                                    <div style={{
                                        flex: 1, padding: "24px 28px", borderRadius: "16px",
                                        border: `1px solid ${theme.primaryColor}10`,
                                        background: `${theme.backgroundColor || '#fff'}`,
                                        transition: "all 0.3s",
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px ${theme.primaryColor}08`; e.currentTarget.style.borderColor = `${theme.primaryColor}20`; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${theme.primaryColor}10`; }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                            <span style={{ fontSize: "22px" }}>{item.icon}</span>
                                            <h3 style={{ fontSize: "17px", fontWeight: 700, color: theme.textColor }} contentEditable={editMode} suppressContentEditableWarning data-editable="true">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7, marginBottom: item.price ? "12px" : "0" }} contentEditable={editMode} suppressContentEditableWarning data-editable="true">
                                            {item.description}
                                        </p>
                                        {item.price && (
                                            <div style={{ display: "inline-flex", padding: "4px 14px", borderRadius: "8px", background: `${theme.primaryColor}08`, fontSize: "14px", fontWeight: 700, color: theme.primaryColor }}>
                                                {item.price}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // ─── Layout: Grid (default) ───
    return (
        <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${theme.primaryColor}04, ${theme.backgroundColor || '#fff'})`, position: "relative" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <SectionHeader />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                    {content.items?.map((item, i) => (
                        <div key={i} style={{
                            padding: "36px 28px", borderRadius: "20px",
                            border: `1px solid ${theme.primaryColor}10`,
                            background: `${theme.backgroundColor || '#fff'}`,
                            transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                            position: "relative", overflow: "hidden",
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 24px 48px ${theme.primaryColor}12`; e.currentTarget.style.borderColor = `${theme.primaryColor}25`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${theme.primaryColor}10`; }}
                        >
                            <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: "3px", borderRadius: "0 3px 3px 0", background: `linear-gradient(180deg, ${theme.primaryColor}, ${theme.secondaryColor})`, opacity: 0.5 }} />
                            <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: `linear-gradient(135deg, ${theme.primaryColor}12, ${theme.secondaryColor}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "20px" }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px", color: theme.textColor, letterSpacing: "-0.01em" }} contentEditable={editMode} suppressContentEditableWarning data-editable="true">
                                {item.title}
                            </h3>
                            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7, marginBottom: "20px" }} contentEditable={editMode} suppressContentEditableWarning data-editable="true">
                                {item.description}
                            </p>
                            {item.price && (
                                <div style={{ display: "inline-flex", padding: "6px 16px", borderRadius: "8px", background: `linear-gradient(135deg, ${theme.primaryColor}10, ${theme.secondaryColor}08)`, border: `1px solid ${theme.primaryColor}15`, fontSize: "14px", fontWeight: 700, color: theme.primaryColor }}>
                                    {item.price}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
