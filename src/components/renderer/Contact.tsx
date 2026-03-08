"use client";

import React from "react";

interface ContactProps {
    content: {
        layout?: string;
        title: string;
        subtitle: string;
        email: string;
        phone: string;
        address: string;
        formFields: { label: string; type: string; placeholder: string }[];
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function ContactRenderer({ content, theme, editMode, onUpdate }: ContactProps) {
    const layout = content.layout || "split";

    const contactItems = [
        { icon: "📧", label: "Email", value: content.email },
        { icon: "📱", label: "Phone", value: content.phone },
        { icon: "📍", label: "Address", value: content.address },
    ];

    // ─── Shared: Form ───
    const ContactForm = ({ cardStyle = true }: { cardStyle?: boolean }) => (
        <form
            style={{
                display: "flex", flexDirection: "column", gap: "18px",
                ...(cardStyle ? { padding: "36px", borderRadius: "24px", background: theme.backgroundColor || "#fff", border: `1px solid ${theme.primaryColor}10`, boxShadow: `0 8px 32px ${theme.primaryColor}06` } : {}),
            }}
            onSubmit={(e) => e.preventDefault()}
        >
            {content.formFields?.map((field, i) => (
                <div key={i}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: theme.textColor }}>{field.label}</label>
                    {field.type === "textarea" ? (
                        <textarea
                            placeholder={field.placeholder}
                            style={{ width: "100%", padding: "14px 18px", border: `1px solid ${theme.primaryColor}12`, borderRadius: "12px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", minHeight: "120px", outline: "none", transition: "border-color 0.3s", background: `${theme.primaryColor}03` }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}40`; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}12`; }}
                        />
                    ) : (
                        <input
                            type={field.type}
                            placeholder={field.placeholder}
                            style={{ width: "100%", padding: "14px 18px", border: `1px solid ${theme.primaryColor}12`, borderRadius: "12px", fontSize: "14px", fontFamily: "inherit", outline: "none", transition: "border-color 0.3s", background: `${theme.primaryColor}03` }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}40`; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}12`; }}
                        />
                    )}
                </div>
            ))}
            <button type="submit" style={{
                padding: "16px", borderRadius: "14px",
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                color: "#fff", border: "none", fontSize: "15px", fontWeight: 700,
                cursor: "pointer", transition: "all 0.3s",
                boxShadow: `0 8px 24px ${theme.primaryColor}25`, marginTop: "4px",
            }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >Send Message →</button>
        </form>
    );

    // ─── Layout: Centered (stacked) ───
    if (layout === "centered") {
        return (
            <section style={{ padding: "120px 24px", background: theme.backgroundColor || "#fff", position: "relative" }}>
                <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        ✦ Get In Touch
                    </div>
                    <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, marginBottom: "16px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                    >{content.title}</h2>
                    <p style={{ fontSize: "17px", color: "#64748b", marginBottom: "40px", lineHeight: 1.7 }}>{content.subtitle}</p>
                    {/* Contact info inline */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "48px", flexWrap: "wrap" }}>
                        {contactItems.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#64748b" }}>
                                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                                <span style={{ fontWeight: 500 }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <ContactForm cardStyle={false} />
                </div>
            </section>
        );
    }

    // ─── Layout: Card (form inside gradient card) ───
    if (layout === "card") {
        return (
            <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${theme.primaryColor}04, ${theme.backgroundColor || '#fff'})`, position: "relative" }}>
                <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                    <div style={{
                        padding: "48px 40px", borderRadius: "28px",
                        background: `linear-gradient(160deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                        color: "#fff", position: "relative", overflow: "hidden",
                    }}>
                        <div style={{ position: "absolute", top: "-30%", right: "-20%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
                        <div style={{ textAlign: "center", marginBottom: "40px", position: "relative", zIndex: 1 }}>
                            <h2 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.03em" }}
                                contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                            >{content.title}</h2>
                            <p style={{ fontSize: "16px", opacity: 0.85, maxWidth: "500px", margin: "0 auto" }}>{content.subtitle}</p>
                        </div>
                        <form style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }} onSubmit={(e) => e.preventDefault()}>
                            {content.formFields?.map((field, i) => (
                                <div key={i}>
                                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.8 }}>{field.label}</label>
                                    {field.type === "textarea" ? (
                                        <textarea placeholder={field.placeholder} style={{ width: "100%", padding: "14px 18px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", minHeight: "100px", outline: "none", background: "rgba(255,255,255,0.1)", color: "#fff" }} />
                                    ) : (
                                        <input type={field.type} placeholder={field.placeholder} style={{ width: "100%", padding: "14px 18px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", fontSize: "14px", fontFamily: "inherit", outline: "none", background: "rgba(255,255,255,0.1)", color: "#fff" }} />
                                    )}
                                </div>
                            ))}
                            <button type="submit" style={{ padding: "16px", borderRadius: "12px", background: "#fff", color: theme.primaryColor, border: "none", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "all 0.3s", marginTop: "8px" }}>
                                Send Message →
                            </button>
                        </form>
                        {/* Contact info below */}
                        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.15)", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
                            {contactItems.map((item, i) => (
                                <span key={i} style={{ fontSize: "13px", opacity: 0.75 }}>{item.icon} {item.value}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // ─── Layout: Split (default) ───
    return (
        <section style={{ padding: "120px 24px", background: `linear-gradient(180deg, ${theme.primaryColor}04, ${theme.backgroundColor || '#fff'})`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "10%", left: "-10%", width: "400px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle, ${theme.primaryColor}06, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ maxWidth: "1060px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                <div style={{ textAlign: "center", marginBottom: "72px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: `${theme.primaryColor}08`, border: `1px solid ${theme.primaryColor}15`, color: theme.primaryColor, fontSize: "12px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        ✦ Contact
                    </div>
                    <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, marginBottom: "16px", color: theme.textColor, letterSpacing: "-0.03em", lineHeight: 1.15 }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                    >{content.title}</h2>
                    <p style={{ fontSize: "17px", color: "#64748b", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>{content.subtitle}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "48px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {contactItems.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", borderRadius: "16px", border: `1px solid ${theme.primaryColor}10`, background: `${theme.backgroundColor || '#fff'}`, transition: "all 0.3s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}25`; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${theme.primaryColor}10`; }}
                            >
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `linear-gradient(135deg, ${theme.primaryColor}12, ${theme.secondaryColor}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{item.icon}</div>
                                <div>
                                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>{item.label}</div>
                                    <div style={{ fontSize: "14px", color: theme.textColor, fontWeight: 500 }}>{item.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <ContactForm />
                </div>
            </div>
        </section>
    );
}
