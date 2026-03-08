"use client";

import React from "react";
import { WebsiteData, WebsiteSection, WebsiteTheme } from "@/lib/schemas";
import NavbarRenderer from "./Navbar";
import HeroRenderer from "./Hero";
import FeaturesRenderer from "./Features";
import PricingRenderer from "./Pricing";
import AboutRenderer from "./About";
import ContactRenderer from "./Contact";
import ServicesRenderer from "./Services";
import ProductGridRenderer from "./ProductGrid";
import MenuCardRenderer from "./MenuCard";
import FooterRenderer from "./Footer";
import TestimonialsRenderer from "./Testimonials";
import PromoBannerRenderer from "./PromoBanner";
import CollectionGridRenderer from "./CollectionGrid";
import NewsletterRenderer from "./Newsletter";
import TrustBadgesRenderer from "./TrustBadges";
import FAQRenderer from "./FAQ";
import CustomSectionRenderer from "./CustomSection";
import { StoreProvider, useStore } from "./StoreProvider";
import CartDrawer from "./CartDrawer";
import AuthModal from "./AuthModal";
import ProductDetailModal from "./ProductDetailModal";
import CheckoutModal from "./CheckoutModal";

interface WebsiteRendererProps {
    data: WebsiteData;
    editMode?: boolean;
    selectedSection?: string | null;
    onSectionClick?: (sectionId: string) => void;
    onContentChange?: (sectionId: string, content: any) => void;
}

const SECTION_COMPONENTS: Record<string, React.FC<any>> = {
    navbar: NavbarRenderer,
    hero: HeroRenderer,
    features: FeaturesRenderer,
    pricing: PricingRenderer,
    about: AboutRenderer,
    contact: ContactRenderer,
    services: ServicesRenderer,
    "product-grid": ProductGridRenderer,
    "menu-card": MenuCardRenderer,
    footer: FooterRenderer,
    testimonials: TestimonialsRenderer,
    "promo-banner": PromoBannerRenderer,
    "collection-grid": CollectionGridRenderer,
    newsletter: NewsletterRenderer,
    "trust-badges": TrustBadgesRenderer,
    faq: FAQRenderer,
    custom: CustomSectionRenderer,
};

function NotificationToast({ theme }: { theme: any }) {
    const store = useStore();
    if (!store?.notification) return null;

    return (
        <div style={{
            position: "fixed", bottom: "24px", right: "24px", zIndex: 99999,
            padding: "16px 24px", borderRadius: "14px",
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            color: "#fff", fontSize: "14px", fontWeight: 600,
            boxShadow: `0 8px 32px ${theme.primaryColor}30`,
            animation: "slideUpFade 0.3s ease",
            display: "flex", alignItems: "center", gap: "10px",
        }}>
            <span>✓</span> {store.notification}
        </div>
    );
}

function WebsiteContent({
    data,
    editMode,
    selectedSection,
    onSectionClick,
    onContentChange,
}: WebsiteRendererProps) {
    const theme = data.theme || {
        primaryColor: "#6366f1",
        secondaryColor: "#0ea5e9",
        accentColor: "#f43f5e",
        backgroundColor: "#ffffff",
        textColor: "#1a1a2e",
        fontFamily: "Inter",
    };

    return (
        <div
            className={`rendered-website ${editMode ? "edit-mode" : ""}`}
            style={{
                "--site-primary": theme.primaryColor,
                "--site-secondary": theme.secondaryColor,
                "--site-accent": theme.accentColor,
                "--site-bg": theme.backgroundColor,
                "--site-text": theme.textColor,
                "--site-font": theme.fontFamily,
                fontFamily: `'${theme.fontFamily}', sans-serif`,
                background: theme.backgroundColor,
                color: theme.textColor,
            } as React.CSSProperties}
        >
            {data.sections.map((section) => {
                const Component = SECTION_COMPONENTS[section.type];
                if (!Component) return null;

                const customStyle = (section as any).customStyle || {};
                const isBoxed = customStyle.containerStyle === "boxed" || customStyle.containerStyle === "card";

                const sectionWrapperStyle: React.CSSProperties = {
                    ...(customStyle.backgroundColor && { background: customStyle.backgroundColor }),
                    ...(customStyle.padding && { padding: customStyle.padding }),
                    ...(customStyle.textAlign && { textAlign: customStyle.textAlign as any }),
                    ...(isBoxed && {
                        maxWidth: customStyle.maxWidth || "1200px",
                        margin: "0 auto",
                        borderRadius: customStyle.borderRadius || "16px",
                        ...(customStyle.containerStyle === "card" && {
                            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                            border: "1px solid rgba(0,0,0,0.08)",
                        }),
                    }),
                };

                return (
                    <div
                        key={section.id}
                        className={`rendered-section ${selectedSection === section.id ? "selected" : ""
                            }`}
                        style={sectionWrapperStyle}
                        onClick={(e) => {
                            if (editMode && onSectionClick) {
                                e.stopPropagation();
                                onSectionClick(section.id);
                            }
                        }}
                    >
                        {editMode && (
                            <div className="section-controls">
                                <button
                                    className="section-control-btn"
                                    title="AI Rewrite"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    ✨
                                </button>
                                <button
                                    className="section-control-btn"
                                    title="Delete Section"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>
                        )}
                        <Component
                            content={section.content}
                            theme={theme}
                            editMode={editMode}
                            customStyle={customStyle}
                            onUpdate={(newContent: any) => {
                                if (onContentChange) {
                                    onContentChange(section.id, newContent);
                                }
                            }}
                        />
                    </div>
                );
            })}

            {/* Overlay components */}
            <CartDrawer theme={theme} />
            <AuthModal theme={theme} />
            <ProductDetailModal theme={theme} />
            <CheckoutModal theme={theme} />
            <NotificationToast theme={theme} />

            <style>{`
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default function WebsiteRenderer(props: WebsiteRendererProps) {
    if (!props.data || !props.data.sections) {
        return (
            <div style={{ padding: "80px 20px", textAlign: "center", color: "#666" }}>
                <p style={{ fontSize: "48px", marginBottom: "16px" }}>🎨</p>
                <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>No content yet</h3>
                <p>Generate a website using AI or select a template to get started.</p>
            </div>
        );
    }

    return (
        <StoreProvider>
            <WebsiteContent {...props} />
        </StoreProvider>
    );
}
