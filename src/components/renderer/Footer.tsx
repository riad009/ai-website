"use client";

import React from "react";

interface FooterProps {
    content: {
        logo: string;
        description: string;
        links: { title: string; items: { label: string; href: string }[] }[];
        social: { platform: string; url: string }[];
        copyright: string;
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

const socialIcons: Record<string, string> = {
    facebook: "📘",
    twitter: "🐦",
    instagram: "📷",
    linkedin: "💼",
    youtube: "📺",
    tiktok: "🎵",
    github: "💻",
    dribbble: "🏀",
    pinterest: "📌",
    google: "🔍",
};

export default function FooterRenderer({ content, theme, editMode, onUpdate }: FooterProps) {
    return (
        <footer style={{ padding: "80px 24px 32px", background: "#0f172a", color: "rgba(255,255,255,0.7)", position: "relative", overflow: "hidden" }}>
            {/* Top gradient border */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor}, ${theme.accentColor || theme.primaryColor})` }} />

            {/* Decorative orb */}
            <div style={{ position: "absolute", bottom: "-30%", right: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.primaryColor}08, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(auto-fit, minmax(150px, 1fr))", gap: "48px", marginBottom: "56px" }}>
                    {/* Brand column */}
                    <div>
                        <div
                            style={{
                                fontSize: "24px", fontWeight: 800, marginBottom: "16px",
                                background: `linear-gradient(135deg, #fff, rgba(255,255,255,0.7))`,
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                            }}
                            contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                        >
                            {content.logo}
                        </div>
                        <p
                            style={{ fontSize: "14px", lineHeight: 1.8, maxWidth: "300px", marginBottom: "28px", color: "rgba(255,255,255,0.5)" }}
                            contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                        >
                            {content.description}
                        </p>
                        {/* Social icons */}
                        <div style={{ display: "flex", gap: "10px" }}>
                            {content.social?.map((s, i) => (
                                <a key={i} href={s.url} style={{
                                    width: "40px", height: "40px", borderRadius: "12px",
                                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    textDecoration: "none", fontSize: "16px", transition: "all 0.3s",
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = `${theme.primaryColor}30`;
                                        e.currentTarget.style.borderColor = `${theme.primaryColor}50`;
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    {socialIcons[s.platform.toLowerCase()] || "🔗"}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {content.links?.map((group, i) => (
                        <div key={i}>
                            <h4 style={{
                                fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: "20px",
                                textTransform: "uppercase", letterSpacing: "0.08em",
                            }}>
                                {group.title}
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {group.items?.map((link, j) => (
                                    <a key={j} href={link.href} style={{
                                        fontSize: "14px", color: "rgba(255,255,255,0.45)", textDecoration: "none",
                                        transition: "all 0.25s", display: "inline-flex", alignItems: "center",
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateX(4px)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.transform = "translateX(0)"; }}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "28px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontSize: "13px", color: "rgba(255,255,255,0.3)",
                }}>
                    <span>{content.copyright}</span>
                    <div style={{ display: "flex", gap: "24px" }}>
                        <a href="#" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"} onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>Privacy</a>
                        <a href="#" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"} onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
