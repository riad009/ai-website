"use client";

import React, { useState } from "react";

interface FAQProps {
    content: {
        title: string;
        subtitle: string;
        items: { question: string; answer: string }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function FAQRenderer({ content, theme, editMode, onUpdate }: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section style={{ padding: "120px 24px", background: theme.backgroundColor || "#fff", position: "relative" }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "64px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        ✦ FAQ
                    </div>
                    <h2
                        style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, marginBottom: "14px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                    >
                        {content.title}
                    </h2>
                    <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
                        {content.subtitle}
                    </p>
                </div>

                {/* Accordion items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {content.items?.map((item, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div
                                key={i}
                                style={{
                                    borderRadius: "16px",
                                    border: `1px solid ${isOpen ? theme.primaryColor + '20' : theme.primaryColor + '08'}`,
                                    background: isOpen ? `${theme.primaryColor}04` : "transparent",
                                    overflow: "hidden",
                                    transition: "all 0.3s",
                                }}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                    style={{
                                        width: "100%", padding: "22px 24px",
                                        background: "none", border: "none",
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        cursor: "pointer", textAlign: "left",
                                    }}
                                >
                                    <span style={{ fontSize: "15px", fontWeight: 600, color: theme.textColor, letterSpacing: "-0.01em", lineHeight: 1.4, paddingRight: "16px" }}>
                                        {item.question}
                                    </span>
                                    <span style={{
                                        width: "28px", height: "28px", borderRadius: "8px",
                                        background: isOpen ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` : `${theme.primaryColor}10`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "14px", fontWeight: 700, flexShrink: 0,
                                        color: isOpen ? "#fff" : theme.primaryColor,
                                        transition: "all 0.3s", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                                    }}>
                                        +
                                    </span>
                                </button>
                                {isOpen && (
                                    <div style={{
                                        padding: "0 24px 22px 24px",
                                        fontSize: "14px", color: "#64748b", lineHeight: 1.8,
                                    }}>
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
