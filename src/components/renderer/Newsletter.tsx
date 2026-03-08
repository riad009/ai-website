"use client";

import React from "react";

interface NewsletterProps {
    content: {
        title: string;
        subtitle: string;
        placeholder: string;
        buttonText: string;
        incentive: string;
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function NewsletterRenderer({ content, theme, editMode, onUpdate }: NewsletterProps) {
    return (
        <section style={{
            padding: "100px 24px",
            background: `linear-gradient(135deg, ${theme.primaryColor}08, ${theme.secondaryColor}06, ${theme.primaryColor}04)`,
            position: "relative", overflow: "hidden",
        }}>
            {/* Decorative orbs */}
            <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.primaryColor}10, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.secondaryColor}08, transparent 70%)`, pointerEvents: "none" }} />

            <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
                {/* Incentive badge */}
                {content.incentive && (
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "8px 20px", borderRadius: "100px",
                        background: `linear-gradient(135deg, ${theme.accentColor || theme.primaryColor}15, ${theme.primaryColor}10)`,
                        border: `1px solid ${theme.accentColor || theme.primaryColor}20`,
                        color: theme.accentColor || theme.primaryColor,
                        fontSize: "13px", fontWeight: 700, marginBottom: "28px",
                    }}>
                        🎁 {content.incentive}
                    </div>
                )}

                <h2
                    style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 800, marginBottom: "14px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.2 }}
                    contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                >
                    {content.title}
                </h2>
                <p
                    style={{ fontSize: "16px", color: "#64748b", lineHeight: 1.7, marginBottom: "36px" }}
                    contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                >
                    {content.subtitle}
                </p>

                {/* Email form */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    style={{
                        display: "flex", gap: "10px",
                        padding: "6px", borderRadius: "16px",
                        background: theme.backgroundColor || "#fff",
                        border: `1px solid ${theme.primaryColor}12`,
                        boxShadow: `0 8px 32px ${theme.primaryColor}08`,
                        maxWidth: "500px", margin: "0 auto",
                    }}
                >
                    <input
                        type="email"
                        placeholder={content.placeholder || "Enter your email address"}
                        style={{
                            flex: 1, padding: "16px 20px", border: "none",
                            fontSize: "15px", fontFamily: "inherit", outline: "none",
                            background: "transparent", color: theme.textColor,
                            borderRadius: "12px",
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: "16px 32px", borderRadius: "12px",
                            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                            color: "#fff", border: "none", fontSize: "14px", fontWeight: 700,
                            cursor: "pointer", transition: "all 0.3s", whiteSpace: "nowrap",
                            boxShadow: `0 4px 16px ${theme.primaryColor}25`,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${theme.primaryColor}40`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px ${theme.primaryColor}25`; }}
                    >
                        {content.buttonText || "Subscribe"}
                    </button>
                </form>

                {/* Trust text */}
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "16px" }}>
                    No spam, ever. Unsubscribe at any time. By subscribing you agree to our Privacy Policy.
                </p>
            </div>
        </section>
    );
}
