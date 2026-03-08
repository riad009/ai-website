"use client";

import React from "react";

interface PricingProps {
    content: {
        layout?: string;
        title: string;
        subtitle: string;
        plans: {
            name: string;
            price: string;
            period: string;
            features: string[];
            ctaText: string;
            highlighted: boolean;
        }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function PricingRenderer({ content, theme, editMode, onUpdate }: PricingProps) {
    const layout = content.layout || "cards";

    // ─── Shared: Section header ───
    const SectionHeader = () => (
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                ✦ Pricing
            </div>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, marginBottom: "16px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                contentEditable={editMode} suppressContentEditableWarning data-editable="true"
            >{content.title}</h2>
            <p style={{ fontSize: "17px", color: "#64748b", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>{content.subtitle}</p>
        </div>
    );

    // ─── Layout: Compact (horizontal comparison rows) ───
    if (layout === "compact") {
        return (
            <section style={{ padding: "120px 24px", background: theme.backgroundColor || "#fff", position: "relative" }}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <SectionHeader />
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {content.plans?.map((plan, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: "24px",
                                padding: plan.highlighted ? "28px 32px" : "24px 28px",
                                borderRadius: "16px",
                                background: plan.highlighted
                                    ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                                    : theme.backgroundColor || "#fff",
                                color: plan.highlighted ? "#fff" : theme.textColor,
                                border: plan.highlighted ? "none" : `1px solid ${theme.primaryColor}10`,
                                boxShadow: plan.highlighted ? `0 12px 40px ${theme.primaryColor}30` : "none",
                                transition: "all 0.3s", flexWrap: "wrap",
                            }}
                                onMouseEnter={(e) => { if (!plan.highlighted) { e.currentTarget.style.borderColor = `${theme.primaryColor}25`; e.currentTarget.style.boxShadow = `0 8px 24px ${theme.primaryColor}10`; } }}
                                onMouseLeave={(e) => { if (!plan.highlighted) { e.currentTarget.style.borderColor = `${theme.primaryColor}10`; e.currentTarget.style.boxShadow = "none"; } }}
                            >
                                <div style={{ flex: "0 0 140px" }}>
                                    <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{plan.name}</div>
                                    <div style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.03em" }}>
                                        {plan.price}<span style={{ fontSize: "14px", fontWeight: 500, opacity: 0.6 }}>{plan.period}</span>
                                    </div>
                                </div>
                                <div style={{ flex: 1, display: "flex", gap: "12px", flexWrap: "wrap", minWidth: "200px" }}>
                                    {plan.features?.slice(0, 4).map((f, j) => (
                                        <span key={j} style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "100px", background: plan.highlighted ? "rgba(255,255,255,0.15)" : `${theme.primaryColor}06`, border: `1px solid ${plan.highlighted ? "rgba(255,255,255,0.2)" : `${theme.primaryColor}10`}`, whiteSpace: "nowrap" }}>
                                            ✓ {f}
                                        </span>
                                    ))}
                                </div>
                                <a href="#" style={{
                                    padding: "12px 28px", borderRadius: "12px", textDecoration: "none", fontSize: "14px", fontWeight: 700, flexShrink: 0,
                                    background: plan.highlighted ? "rgba(255,255,255,0.2)" : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                                    color: "#fff", border: plan.highlighted ? "1px solid rgba(255,255,255,0.25)" : "none",
                                    transition: "all 0.3s",
                                }}>
                                    {plan.ctaText}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ─── Layout: Minimal (simple table-like) ───
    if (layout === "minimal") {
        return (
            <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${theme.primaryColor}03, ${theme.backgroundColor || '#fff'})`, position: "relative" }}>
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <SectionHeader />
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(content.plans?.length || 3, 3)}, 1fr)`, gap: "0", border: `1px solid ${theme.primaryColor}10`, borderRadius: "20px", overflow: "hidden" }}>
                        {content.plans?.map((plan, i) => (
                            <div key={i} style={{
                                padding: "40px 32px", textAlign: "center",
                                background: plan.highlighted ? `${theme.primaryColor}06` : theme.backgroundColor || "#fff",
                                borderRight: i < (content.plans?.length || 0) - 1 ? `1px solid ${theme.primaryColor}10` : "none",
                                position: "relative",
                            }}>
                                {plan.highlighted && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})` }} />}
                                <h3 style={{ fontSize: "16px", fontWeight: 700, color: theme.textColor, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{plan.name}</h3>
                                <div style={{ fontSize: "44px", fontWeight: 900, color: theme.textColor, letterSpacing: "-0.04em", marginBottom: "4px" }}>{plan.price}</div>
                                <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "32px" }}>{plan.period}</div>
                                <div style={{ height: "1px", background: `${theme.primaryColor}10`, marginBottom: "24px" }} />
                                <ul style={{ listStyle: "none", padding: 0, textAlign: "left", marginBottom: "32px" }}>
                                    {plan.features?.map((f, j) => (
                                        <li key={j} style={{ padding: "8px 0", fontSize: "14px", color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ color: theme.primaryColor, fontSize: "14px" }}>✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                                <a href="#" style={{
                                    display: "block", padding: "14px", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 700,
                                    background: plan.highlighted ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` : "transparent",
                                    color: plan.highlighted ? "#fff" : theme.primaryColor,
                                    border: plan.highlighted ? "none" : `2px solid ${theme.primaryColor}`,
                                    transition: "all 0.3s",
                                }}>
                                    {plan.ctaText}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ─── Layout: Cards (default) ───
    return (
        <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${theme.backgroundColor || '#fff'}, ${theme.primaryColor}05)`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "20%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.primaryColor}06, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ maxWidth: "1140px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                <SectionHeader />
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(content.plans?.length || 3, 3)}, 1fr)`, gap: "20px", alignItems: "stretch" }}>
                    {content.plans?.map((plan, i) => (
                        <div key={i} style={{
                            padding: plan.highlighted ? "44px 36px" : "40px 32px",
                            borderRadius: "24px",
                            background: plan.highlighted ? `linear-gradient(160deg, ${theme.primaryColor}, ${theme.secondaryColor})` : theme.backgroundColor || "#fff",
                            color: plan.highlighted ? "#fff" : theme.textColor,
                            border: plan.highlighted ? "none" : `1px solid ${theme.primaryColor}12`,
                            boxShadow: plan.highlighted ? `0 24px 64px ${theme.primaryColor}35` : "none",
                            textAlign: "center", position: "relative",
                            transform: plan.highlighted ? "scale(1.04)" : "scale(1)",
                            transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                            display: "flex", flexDirection: "column" as const, overflow: "hidden",
                        }}
                            onMouseEnter={(e) => { if (!plan.highlighted) { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 20px 44px ${theme.primaryColor}15`; } }}
                            onMouseLeave={(e) => { if (!plan.highlighted) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; } }}
                        >
                            {plan.highlighted && <div style={{ position: "absolute", top: "-50%", left: "-20%", width: "140%", height: "100%", background: "radial-gradient(ellipse, rgba(255,255,255,0.12), transparent 60%)", pointerEvents: "none" }} />}
                            {plan.highlighted && (
                                <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", background: theme.accentColor || "#f43f5e", color: "#fff", padding: "8px 28px", borderRadius: "0 0 14px 14px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Most Popular</div>
                            )}
                            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", marginTop: plan.highlighted ? "16px" : "0" }}>{plan.name}</h3>
                            <div style={{ fontSize: "52px", fontWeight: 900, marginBottom: "4px", letterSpacing: "-0.04em" }}>{plan.price}</div>
                            <div style={{ fontSize: "14px", opacity: 0.65, marginBottom: "36px" }}>{plan.period}</div>
                            <div style={{ height: "1px", background: plan.highlighted ? "rgba(255,255,255,0.15)" : `${theme.primaryColor}10`, marginBottom: "28px" }} />
                            <ul style={{ listStyle: "none", padding: 0, textAlign: "left", flex: 1, marginBottom: "36px" }}>
                                {plan.features?.map((f, j) => (
                                    <li key={j} style={{ padding: "9px 0", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", opacity: 0.9 }}>
                                        <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: plan.highlighted ? "rgba(255,255,255,0.18)" : `${theme.primaryColor}10`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0, color: plan.highlighted ? "#fff" : theme.primaryColor }}>✓</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <a href="#" style={{
                                display: "block", padding: "16px", borderRadius: "14px",
                                background: plan.highlighted ? "rgba(255,255,255,0.2)" : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                                color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "15px",
                                transition: "all 0.3s", textAlign: "center" as const,
                                border: plan.highlighted ? "1px solid rgba(255,255,255,0.25)" : "none",
                                boxShadow: plan.highlighted ? "none" : `0 8px 24px ${theme.primaryColor}25`,
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                            >{plan.ctaText}</a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
