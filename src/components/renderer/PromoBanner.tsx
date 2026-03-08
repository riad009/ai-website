"use client";

import React, { useState } from "react";

interface PromoBannerProps {
    content: {
        texts: string[];
        link: string;
        linkText: string;
        backgroundColor: string;
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function PromoBannerRenderer({ content, theme, editMode, onUpdate }: PromoBannerProps) {
    const [visible, setVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!visible) return null;

    const texts = content.texts || ["Free shipping on orders over $50"];

    return (
        <div
            style={{
                background: content.backgroundColor || `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                padding: "10px 48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Subtle shimmer overlay */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
                animation: "promoShimmer 3s ease-in-out infinite",
            }} />

            {/* Navigation arrows (if multiple texts) */}
            {texts.length > 1 && (
                <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + texts.length) % texts.length)}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: "14px", cursor: "pointer", padding: "4px", transition: "color 0.2s", position: "relative", zIndex: 1 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                >
                    ‹
                </button>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1 }}>
                <span style={{ fontSize: "13px", color: "#fff", fontWeight: 600, letterSpacing: "0.02em" }}>
                    {texts[currentIndex]}
                </span>
                {content.link && content.linkText && (
                    <a
                        href={content.link}
                        style={{
                            fontSize: "12px", color: "#fff", fontWeight: 700,
                            textDecoration: "underline", textUnderlineOffset: "3px",
                            transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                        {content.linkText}
                    </a>
                )}
            </div>

            {texts.length > 1 && (
                <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % texts.length)}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: "14px", cursor: "pointer", padding: "4px", transition: "color 0.2s", position: "relative", zIndex: 1 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                >
                    ›
                </button>
            )}

            {/* Close button */}
            {!editMode && (
                <button
                    onClick={() => setVisible(false)}
                    style={{
                        position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", color: "rgba(255,255,255,0.5)",
                        fontSize: "16px", cursor: "pointer", padding: "4px 6px", transition: "color 0.2s", zIndex: 1,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                >
                    ×
                </button>
            )}

            <style>{`
                @keyframes promoShimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
