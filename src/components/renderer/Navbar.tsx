"use client";

import React from "react";
import { useStore } from "./StoreProvider";

interface NavbarProps {
    content: {
        layout?: string;
        logo: string;
        links: { label: string; href: string }[];
        ctaText: string;
        ctaLink: string;
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function NavbarRenderer({ content, theme, editMode, onUpdate }: NavbarProps) {
    const store = useStore();
    const layout = content.layout || "standard";

    // ─── Shared: Right-side store buttons (search, user, cart) ───
    const StoreButtons = () => (
        <>
            {store && (
                <button
                    onClick={() => { const el = document.getElementById("product-search"); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                    style={{ width: "40px", height: "40px", borderRadius: "12px", border: `1px solid ${theme.primaryColor}10`, background: "transparent", cursor: "pointer", fontSize: "16px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.primaryColor}08`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >🔍</button>
            )}
            {store && (
                store.user ? (
                    <button onClick={() => store.setAuthOpen(true)} style={{ width: "40px", height: "40px", borderRadius: "12px", background: `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor}10)`, border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 800, color: theme.primaryColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {store.user.name.charAt(0).toUpperCase()}
                    </button>
                ) : (
                    <button onClick={() => { store.setAuthTab("login"); store.setAuthOpen(true); }} style={{ width: "40px", height: "40px", borderRadius: "12px", border: `1px solid ${theme.primaryColor}10`, background: "transparent", cursor: "pointer", fontSize: "16px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.primaryColor}08`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >👤</button>
                )
            )}
            {store ? (
                <button onClick={() => store.setCartOpen(true)} style={{ position: "relative", height: "40px", padding: "0 18px", borderRadius: "12px", background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, color: "#fff", border: "none", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 12px ${theme.primaryColor}20`, transition: "all 0.3s", display: "flex", alignItems: "center", gap: "8px" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                    🛒 <span>Cart</span>
                    {store.cartCount > 0 && (
                        <span style={{ position: "absolute", top: "-6px", right: "-6px", width: "22px", height: "22px", borderRadius: "50%", background: theme.accentColor || "#f43f5e", color: "#fff", fontSize: "11px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>{store.cartCount}</span>
                    )}
                </button>
            ) : (
                <a href={content.ctaLink} style={{ padding: "10px 24px", borderRadius: "12px", background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, color: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: 700, boxShadow: `0 4px 12px ${theme.primaryColor}20`, transition: "all 0.3s" }}>
                    {content.ctaText}
                </a>
            )}
        </>
    );

    // ─── Layout: Centered Logo ───
    if (layout === "centered-logo") {
        return (
            <nav style={{ position: "sticky", top: 0, zIndex: 100, background: `${(theme.backgroundColor || '#ffffff')}e6`, backdropFilter: "blur(20px) saturate(1.8)", WebkitBackdropFilter: "blur(20px) saturate(1.8)", borderBottom: `1px solid ${theme.primaryColor}08` }}>
                {/* Top row — Logo centered */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 48px 8px" }}>
                    <div
                        style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-0.03em", background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", cursor: "pointer" }}
                        contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                    >
                        {content.logo}
                    </div>
                </div>
                {/* Bottom row — Links + CTA */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 48px 12px", gap: "4px" }}>
                    {content.links.map((link, i) => (
                        <a key={i} href={link.href} style={{ color: theme.textColor, textDecoration: "none", fontSize: "13px", fontWeight: 500, padding: "6px 14px", borderRadius: "8px", transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.primaryColor}08`; e.currentTarget.style.color = theme.primaryColor; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.textColor; }}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div style={{ marginLeft: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
                        <StoreButtons />
                    </div>
                </div>
            </nav>
        );
    }

    // ─── Layout: Minimal ───
    if (layout === "minimal") {
        return (
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: "72px", position: "sticky", top: 0, zIndex: 100, background: `${(theme.backgroundColor || '#ffffff')}e6`, backdropFilter: "blur(20px) saturate(1.8)", WebkitBackdropFilter: "blur(20px) saturate(1.8)", borderBottom: `1px solid ${theme.primaryColor}08` }}>
                {/* Logo */}
                <div
                    style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.03em", background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", cursor: "pointer" }}
                    contentEditable={editMode} suppressContentEditableWarning data-editable="true"
                >
                    {content.logo}
                </div>
                {/* CTA only — no nav links */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <StoreButtons />
                </div>
            </nav>
        );
    }

    // ─── Layout: Standard (default) ───
    return (
        <nav style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 48px", height: "72px", position: "sticky", top: 0, zIndex: 100,
            background: `${(theme.backgroundColor || '#ffffff')}e6`,
            backdropFilter: "blur(20px) saturate(1.8)", WebkitBackdropFilter: "blur(20px) saturate(1.8)",
            borderBottom: `1px solid ${theme.primaryColor}08`,
            transition: "all 0.3s",
        }}>
            {/* Logo */}
            <div
                style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.03em", background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", cursor: "pointer" }}
                contentEditable={editMode} suppressContentEditableWarning data-editable="true"
            >
                {content.logo}
            </div>
            {/* Center nav links */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {content.links.map((link, i) => (
                    <a key={i} href={link.href} style={{ color: theme.textColor, textDecoration: "none", fontSize: "14px", fontWeight: 500, padding: "8px 16px", borderRadius: "10px", transition: "all 0.2s", position: "relative" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.primaryColor}08`; e.currentTarget.style.color = theme.primaryColor; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.textColor; }}
                    >
                        {link.label}
                    </a>
                ))}
            </div>
            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <StoreButtons />
            </div>
        </nav>
    );
}
