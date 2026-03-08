"use client";

import React from "react";

interface AboutProps {
    content: {
        layout?: string;
        title: string;
        description: string;
        image: string;
        stats: { value: string; label: string }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function AboutRenderer({ content, theme, editMode, onUpdate }: AboutProps) {
    const layout = content.layout || "split";

    // ─── Shared: Stats grid ───
    const StatsGrid = ({ columns = 4, large = false }: { columns?: number; large?: boolean }) => (
        content.stats && content.stats.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(content.stats.length, columns)}, 1fr)`, gap: large ? "20px" : "24px" }}>
                {content.stats.map((stat, i) => (
                    <div key={i} style={{ padding: large ? "32px 24px" : "20px 16px", borderRadius: large ? "20px" : "16px", background: `linear-gradient(165deg, ${theme.primaryColor}06, ${theme.secondaryColor}04)`, border: `1px solid ${theme.primaryColor}10`, textAlign: "center" }}>
                        <div style={{
                            fontSize: large ? "36px" : "28px", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "4px",
                            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>
                            {stat.value}
                        </div>
                        <div style={{ fontSize: large ? "14px" : "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                    </div>
                ))}
            </div>
        ) : null
    );

    // ─── Layout: Centered ───
    if (layout === "centered") {
        return (
            <section style={{ padding: "120px 24px", background: theme.backgroundColor || "#fff", position: "relative", overflow: "hidden" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "24px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        ✦ About Us
                    </div>
                    <h2
                        style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, marginBottom: "24px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                        onBlur={(e) => { if (onUpdate) onUpdate({ ...content, title: e.currentTarget.textContent || "" }); }}
                    >
                        {content.title}
                    </h2>
                    <p
                        style={{ fontSize: "17px", color: "#64748b", lineHeight: 1.85, marginBottom: "48px", maxWidth: "640px", margin: "0 auto 48px" }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                        onBlur={(e) => { if (onUpdate) onUpdate({ ...content, description: e.currentTarget.textContent || "" }); }}
                    >
                        {content.description}
                    </p>
                    <StatsGrid columns={4} />
                </div>
            </section>
        );
    }

    // ─── Layout: Stats Focus ───
    if (layout === "stats-focus") {
        return (
            <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${theme.primaryColor}04, ${theme.backgroundColor || '#fff'})`, position: "relative", overflow: "hidden" }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                    <div style={{ textAlign: "center", marginBottom: "56px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            ✦ By The Numbers
                        </div>
                        <h2
                            style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, marginBottom: "16px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                            contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                            onBlur={(e) => { if (onUpdate) onUpdate({ ...content, title: e.currentTarget.textContent || "" }); }}
                        >
                            {content.title}
                        </h2>
                    </div>
                    {/* Large stats */}
                    <StatsGrid columns={4} large />
                    {/* Description below */}
                    <p
                        style={{ fontSize: "16px", color: "#64748b", lineHeight: 1.85, marginTop: "48px", textAlign: "center", maxWidth: "700px", margin: "48px auto 0" }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                        onBlur={(e) => { if (onUpdate) onUpdate({ ...content, description: e.currentTarget.textContent || "" }); }}
                    >
                        {content.description}
                    </p>
                </div>
            </section>
        );
    }

    // ─── Layout: Split (default) ───
    return (
        <section style={{ padding: "120px 24px", background: theme.backgroundColor || "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.secondaryColor}08, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", gap: "72px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
                {/* Text content */}
                <div style={{ flex: "1 1 420px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "24px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        ✦ About Us
                    </div>
                    <h2
                        style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, marginBottom: "24px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                        onBlur={(e) => { if (onUpdate) onUpdate({ ...content, title: e.currentTarget.textContent || "" }); }}
                    >
                        {content.title}
                    </h2>
                    <p
                        style={{ fontSize: "16px", color: "#64748b", lineHeight: 1.85, marginBottom: "44px" }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                        onBlur={(e) => { if (onUpdate) onUpdate({ ...content, description: e.currentTarget.textContent || "" }); }}
                    >
                        {content.description}
                    </p>
                    <StatsGrid columns={4} />
                </div>
                {/* Image / placeholder */}
                <div style={{
                    flex: "1 1 340px", minHeight: "400px", borderRadius: "24px",
                    background: content.image ? "transparent" : `linear-gradient(160deg, ${theme.primaryColor}15, ${theme.secondaryColor}20, ${theme.accentColor}08)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "80px", position: "relative", overflow: "hidden",
                    border: content.image ? "none" : `1px solid ${theme.primaryColor}12`,
                }}>
                    {content.image ? (
                        <img src={content.image} alt="About" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "24px" }} />
                    ) : (
                        <>
                            <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${theme.primaryColor}10 1px, transparent 1px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
                            <span style={{ position: "relative", zIndex: 1 }}>🏢</span>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
