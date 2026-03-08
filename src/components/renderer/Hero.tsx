"use client";

import React from "react";

interface HeroProps {
    content: {
        layout?: string;
        headline: string;
        subheadline: string;
        ctaText: string;
        ctaLink: string;
        backgroundImage: string;
        overlayOpacity: number;
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function HeroRenderer({ content, theme, editMode, onUpdate }: HeroProps) {
    const layout = content.layout || "centered";
    const hasImage = !!content.backgroundImage;

    // ─── Layout: Split Left ───
    if (layout === "split-left") {
        return (
            <section
                style={{
                    minHeight: "92vh",
                    display: "flex",
                    alignItems: "stretch",
                    background: theme.backgroundColor || "#fff",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Left side — text */}
                <div style={{ flex: "1 1 55%", display: "flex", alignItems: "center", padding: "80px 64px 80px 72px", position: "relative", zIndex: 1 }}>
                    <div style={{ maxWidth: "600px" }}>
                        <div
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "8px",
                                padding: "6px 16px", borderRadius: "8px",
                                background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`,
                                color: theme.primaryColor, fontSize: "12px", fontWeight: 700,
                                marginBottom: "28px", textTransform: "uppercase", letterSpacing: "0.1em",
                            }}
                        >
                            ● Now Available
                        </div>
                        <h1
                            style={{
                                fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900,
                                lineHeight: 1.06, marginBottom: "24px",
                                color: theme.textColor, letterSpacing: "-0.04em",
                            }}
                            contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                            onBlur={(e) => { if (onUpdate) onUpdate({ ...content, headline: e.currentTarget.textContent || "" }); }}
                        >
                            {content.headline}
                        </h1>
                        <p
                            style={{
                                fontSize: "18px", lineHeight: 1.7, marginBottom: "40px",
                                color: "#64748b", maxWidth: "480px",
                            }}
                            contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                            onBlur={(e) => { if (onUpdate) onUpdate({ ...content, subheadline: e.currentTarget.textContent || "" }); }}
                        >
                            {content.subheadline}
                        </p>
                        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                            <a
                                href={content.ctaLink}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "10px",
                                    padding: "16px 36px",
                                    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                                    color: "#fff", borderRadius: "12px", textDecoration: "none",
                                    fontSize: "15px", fontWeight: 700,
                                    boxShadow: `0 8px 24px ${theme.primaryColor}30`,
                                    transition: "transform 0.3s, box-shadow 0.3s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                {content.ctaText} <span>→</span>
                            </a>
                            <a href="#about" style={{ color: theme.textColor, textDecoration: "none", fontSize: "15px", fontWeight: 600, padding: "16px 24px", borderRadius: "12px", border: `1px solid ${theme.primaryColor}15`, transition: "all 0.2s" }}>
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
                {/* Right side — visual */}
                <div style={{
                    flex: "1 1 45%", position: "relative", overflow: "hidden",
                    background: hasImage
                        ? `url(${content.backgroundImage}) center/cover`
                        : `linear-gradient(135deg, ${theme.primaryColor}12, ${theme.secondaryColor}18, ${theme.accentColor}10)`,
                }}>
                    {/* Decorative shapes */}
                    {!hasImage && (
                        <>
                            <div style={{ position: "absolute", top: "15%", left: "20%", width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.primaryColor}25, transparent 70%)`, animation: "heroFloat 8s ease-in-out infinite" }} />
                            <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "200px", height: "200px", borderRadius: "30%", border: `2px solid ${theme.secondaryColor}20`, animation: "heroFloat 10s ease-in-out infinite reverse" }} />
                            <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${theme.primaryColor}15 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "120px", opacity: 0.15 }}>🏗️</div>
                        </>
                    )}
                </div>
                <style>{`
                    @keyframes heroFloat {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        33% { transform: translate(20px, -30px) scale(1.05); }
                        66% { transform: translate(-15px, 15px) scale(0.97); }
                    }
                `}</style>
            </section>
        );
    }

    // ─── Layout: Minimal ───
    if (layout === "minimal") {
        return (
            <section
                style={{
                    minHeight: "85vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "100px 24px",
                    background: hasImage
                        ? `linear-gradient(rgba(0,0,0,${content.overlayOpacity || 0.5}), rgba(0,0,0,${content.overlayOpacity || 0.5})), url(${content.backgroundImage}) center/cover`
                        : theme.backgroundColor || "#fff",
                    position: "relative",
                }}
            >
                <div style={{ maxWidth: "800px", textAlign: "center" }}>
                    <h1
                        style={{
                            fontSize: "clamp(42px, 6.5vw, 80px)", fontWeight: 900,
                            lineHeight: 1.04, marginBottom: "24px",
                            color: hasImage ? "#fff" : theme.textColor,
                            letterSpacing: "-0.04em",
                        }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                        onBlur={(e) => { if (onUpdate) onUpdate({ ...content, headline: e.currentTarget.textContent || "" }); }}
                    >
                        {content.headline}
                    </h1>
                    <p
                        style={{
                            fontSize: "18px", lineHeight: 1.7, marginBottom: "44px",
                            color: hasImage ? "rgba(255,255,255,0.8)" : "#64748b",
                            maxWidth: "560px", margin: "0 auto 44px",
                        }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                        onBlur={(e) => { if (onUpdate) onUpdate({ ...content, subheadline: e.currentTarget.textContent || "" }); }}
                    >
                        {content.subheadline}
                    </p>
                    <a
                        href={content.ctaLink}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "18px 44px",
                            background: theme.primaryColor,
                            color: "#fff", borderRadius: "100px", textDecoration: "none",
                            fontSize: "16px", fontWeight: 700,
                            boxShadow: `0 6px 20px ${theme.primaryColor}30`,
                            transition: "transform 0.3s",
                            letterSpacing: "-0.01em",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
                    >
                        {content.ctaText}
                    </a>
                </div>
                {/* Bottom border accent */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, ${theme.secondaryColor}, transparent)` }} />
            </section>
        );
    }

    // ─── Layout: Centered (default) ───
    return (
        <section
            style={{
                minHeight: "90vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "100px 24px",
                background: hasImage
                    ? `linear-gradient(rgba(0,0,0,${content.overlayOpacity || 0.5}), rgba(0,0,0,${content.overlayOpacity || 0.5})), url(${content.backgroundImage}) center/cover`
                    : `linear-gradient(160deg, ${theme.backgroundColor || '#fff'} 0%, ${theme.primaryColor}08 40%, ${theme.secondaryColor}12 70%, ${theme.primaryColor}06 100%)`,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Animated gradient orb top-right */}
            <div
                style={{
                    position: "absolute", top: "-15%", right: "-10%",
                    width: "600px", height: "600px", borderRadius: "50%",
                    background: `radial-gradient(circle, ${theme.primaryColor}18, ${theme.secondaryColor}08, transparent 70%)`,
                    pointerEvents: "none", animation: "heroFloat 8s ease-in-out infinite",
                }}
            />
            {/* Animated gradient orb bottom-left */}
            <div
                style={{
                    position: "absolute", bottom: "-20%", left: "-10%",
                    width: "500px", height: "500px", borderRadius: "50%",
                    background: `radial-gradient(circle, ${theme.secondaryColor}15, ${theme.accentColor}08, transparent 70%)`,
                    pointerEvents: "none", animation: "heroFloat 10s ease-in-out infinite reverse",
                }}
            />
            {/* Subtle grid pattern */}
            {!hasImage && (
                <div
                    style={{
                        position: "absolute", inset: 0,
                        backgroundImage: `radial-gradient(${theme.primaryColor}08 1px, transparent 1px)`,
                        backgroundSize: "32px 32px", pointerEvents: "none",
                    }}
                />
            )}
            {/* Content */}
            <div style={{ maxWidth: "860px", position: "relative", zIndex: 1 }}>
                {/* Badge pill */}
                <div
                    style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "8px 20px", borderRadius: "100px",
                        background: `${theme.primaryColor}10`, border: `1px solid ${theme.primaryColor}20`,
                        color: theme.primaryColor, fontSize: "13px", fontWeight: 600,
                        marginBottom: "32px", backdropFilter: "blur(10px)",
                    }}
                >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: theme.primaryColor, display: "inline-block" }} />
                    Welcome to the future
                </div>
                <h1
                    style={{
                        fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900,
                        lineHeight: 1.08, marginBottom: "28px",
                        color: hasImage ? "#fff" : theme.textColor,
                        letterSpacing: "-0.03em",
                    }}
                    contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                    onBlur={(e) => { if (onUpdate) onUpdate({ ...content, headline: e.currentTarget.textContent || "" }); }}
                >
                    {content.headline}
                </h1>
                <p
                    style={{
                        fontSize: "19px", lineHeight: 1.7, marginBottom: "48px",
                        color: hasImage ? "rgba(255,255,255,0.85)" : "#64748b",
                        maxWidth: "640px", margin: "0 auto 48px",
                    }}
                    contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                    onBlur={(e) => { if (onUpdate) onUpdate({ ...content, subheadline: e.currentTarget.textContent || "" }); }}
                >
                    {content.subheadline}
                </p>
                {/* Dual CTA buttons */}
                <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                    <a
                        href={content.ctaLink}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "18px 40px",
                            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                            color: "#fff", borderRadius: "14px", textDecoration: "none",
                            fontSize: "16px", fontWeight: 700,
                            boxShadow: `0 8px 32px ${theme.primaryColor}35`,
                            transition: "transform 0.3s, box-shadow 0.3s",
                            letterSpacing: "-0.01em",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow = `0 14px 44px ${theme.primaryColor}50`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = `0 8px 32px ${theme.primaryColor}35`; }}
                    >
                        {content.ctaText}
                        <span style={{ fontSize: "18px" }}>→</span>
                    </a>
                    <a
                        href="#about"
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "18px 36px",
                            background: hasImage ? "rgba(255,255,255,0.12)" : `${theme.primaryColor}08`,
                            color: hasImage ? "#fff" : theme.textColor,
                            borderRadius: "14px", textDecoration: "none",
                            fontSize: "16px", fontWeight: 600,
                            border: hasImage ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${theme.primaryColor}18`,
                            transition: "all 0.3s", backdropFilter: "blur(10px)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = hasImage ? "rgba(255,255,255,0.2)" : `${theme.primaryColor}12`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = hasImage ? "rgba(255,255,255,0.12)" : `${theme.primaryColor}08`; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                        Learn More
                    </a>
                </div>
                {/* Trust badges */}
                <div style={{ marginTop: "56px", display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
                    {["⚡ Lightning Fast", "🔒 Secure", "🌍 Global"].map((badge, i) => (
                        <span key={i} style={{ fontSize: "13px", color: hasImage ? "rgba(255,255,255,0.6)" : "#94a3b8", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                            {badge}
                        </span>
                    ))}
                </div>
            </div>

            {/* CSS Keyframes */}
            <style>{`
                @keyframes heroFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(20px, -30px) scale(1.05); }
                    66% { transform: translate(-15px, 15px) scale(0.97); }
                }
            `}</style>
        </section>
    );
}
