"use client";

import React from "react";

interface TestimonialsProps {
    content: {
        layout?: string;
        title: string;
        subtitle: string;
        items: { name: string; role: string; text: string; rating: number }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function TestimonialsRenderer({ content, theme, editMode, onUpdate }: TestimonialsProps) {
    const layout = content.layout || "cards";

    // ─── Shared: Star rating ───
    const Stars = ({ count = 5 }: { count?: number }) => (
        <div style={{ display: "flex", gap: "3px", marginBottom: "20px" }}>
            {Array.from({ length: count }, (_, j) => (
                <span key={j} style={{ fontSize: "16px", color: "#fbbf24" }}>★</span>
            ))}
        </div>
    );

    // ─── Shared: Section header ───
    const SectionHeader = ({ align = "center" }: { align?: string }) => (
        <div style={{ textAlign: align as any, marginBottom: "72px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                ✦ Testimonials
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

    // ─── Layout: Spotlight ───
    if (layout === "spotlight") {
        const featured = content.items?.[0];
        const rest = content.items?.slice(1) || [];

        return (
            <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${theme.primaryColor}04, ${theme.backgroundColor || '#fff'})`, position: "relative", overflow: "hidden" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                    <SectionHeader />
                    {/* Featured testimonial — big */}
                    {featured && (
                        <div style={{
                            padding: "48px 44px", borderRadius: "24px", marginBottom: "24px",
                            background: `linear-gradient(135deg, ${theme.primaryColor}08, ${theme.secondaryColor}06)`,
                            border: `1px solid ${theme.primaryColor}15`,
                            position: "relative",
                        }}>
                            <div style={{ position: "absolute", top: "20px", right: "32px", fontSize: "80px", fontWeight: 900, lineHeight: 1, background: `linear-gradient(135deg, ${theme.primaryColor}12, transparent)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>"</div>
                            <Stars count={featured.rating || 5} />
                            <p style={{ fontSize: "20px", color: "#475569", lineHeight: 1.8, marginBottom: "32px", maxWidth: "800px", fontStyle: "italic" }} contentEditable={editMode} suppressContentEditableWarning data-editable="true">
                                "{featured.text}"
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 800, color: "#fff" }}>
                                    {featured.name?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <div style={{ fontSize: "17px", fontWeight: 700, color: theme.textColor }}>{featured.name}</div>
                                    <div style={{ fontSize: "14px", color: "#94a3b8" }}>{featured.role}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Rest — smaller grid */}
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`, gap: "16px" }}>
                        {rest.map((item, i) => (
                            <div key={i} style={{ padding: "28px 24px", borderRadius: "16px", border: `1px solid ${theme.primaryColor}10`, background: theme.backgroundColor || "#fff" }}>
                                <Stars count={item.rating || 5} />
                                <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.7, marginBottom: "20px" }} contentEditable={editMode} suppressContentEditableWarning data-editable="true">
                                    "{item.text}"
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${theme.primaryColor}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: theme.primaryColor }}>{item.name?.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 600, color: theme.textColor }}>{item.name}</div>
                                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{item.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ─── Layout: Minimal ───
    if (layout === "minimal") {
        return (
            <section style={{ padding: "120px 24px", background: theme.backgroundColor || "#fff", position: "relative" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <SectionHeader />
                    <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                        {content.items?.map((item, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <Stars count={item.rating || 5} />
                                <p
                                    style={{ fontSize: "18px", color: "#475569", lineHeight: 1.85, marginBottom: "24px", fontStyle: "italic" }}
                                    contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                                >
                                    "{item.text}"
                                </p>
                                <div style={{ fontSize: "15px", fontWeight: 700, color: theme.textColor }}>{item.name}</div>
                                <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>{item.role}</div>
                                {i < (content.items?.length || 0) - 1 && (
                                    <div style={{ width: "60px", height: "1px", background: `${theme.primaryColor}15`, margin: "48px auto 0" }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ─── Layout: Cards (default) ───
    return (
        <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${theme.primaryColor}04, ${theme.backgroundColor || '#fff'})`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "20%", right: "-15%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.primaryColor}06, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                <SectionHeader />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                    {content.items?.map((item, i) => (
                        <div key={i} style={{ padding: "36px 32px", borderRadius: "24px", border: `1px solid ${theme.primaryColor}10`, background: `linear-gradient(165deg, ${theme.backgroundColor || '#fff'}, ${theme.primaryColor}03)`, transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)", position: "relative", overflow: "hidden" }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 24px 48px ${theme.primaryColor}10`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                            <div style={{ position: "absolute", top: "16px", right: "24px", fontSize: "72px", fontWeight: 900, lineHeight: 1, background: `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor}08)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", pointerEvents: "none" }}>"</div>
                            <Stars count={item.rating || 5} />
                            <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.8, marginBottom: "28px", position: "relative", zIndex: 1 }} contentEditable={editMode} suppressContentEditableWarning data-editable="true">
                                "{item.text}"
                            </p>
                            <div style={{ height: "1px", background: `${theme.primaryColor}10`, marginBottom: "20px" }} />
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800, color: theme.primaryColor, border: `1px solid ${theme.primaryColor}15` }}>
                                    {item.name?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <div style={{ fontSize: "15px", fontWeight: 700, color: theme.textColor, letterSpacing: "-0.01em" }}>{item.name}</div>
                                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>{item.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
