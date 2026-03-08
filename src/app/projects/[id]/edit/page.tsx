"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import WebsiteRenderer from "@/components/renderer/WebsiteRenderer";
import { WebsiteData, CATEGORIES, SectionType } from "@/lib/schemas";

const SECTION_ICONS: Record<string, string> = {
    navbar: "🧭",
    hero: "🏠",
    features: "⭐",
    pricing: "💰",
    about: "📖",
    contact: "📧",
    services: "🛠️",
    "product-grid": "🛍️",
    "menu-card": "🍽️",
    footer: "📋",
};

const SECTION_TYPES: { type: SectionType; label: string }[] = [
    { type: "hero", label: "Hero Section" },
    { type: "features", label: "Features" },
    { type: "pricing", label: "Pricing" },
    { type: "about", label: "About" },
    { type: "contact", label: "Contact" },
    { type: "services", label: "Services" },
    { type: "product-grid", label: "Product Grid" },
    { type: "menu-card", label: "Menu Card" },
];

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, update: updateSession } = useSession();
    const projectId = params.id as string;

    const [project, setProject] = useState<any>(null);
    const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
    const [editMode, setEditMode] = useState(true);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [showAddSection, setShowAddSection] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const aiPromptRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setProject(data);
                setWebsiteData(data.content as WebsiteData);
            } else {
                router.push("/dashboard");
            }
        } finally {
            setLoading(false);
        }
    };

    const autoSave = useCallback(
        (data: WebsiteData) => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(async () => {
                setSaving(true);
                try {
                    await fetch(`/api/projects/${projectId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: data }),
                    });
                } finally {
                    setSaving(false);
                }
            }, 1500);
        },
        [projectId]
    );

    const updateWebsiteData = (newData: WebsiteData) => {
        setWebsiteData(newData);
        autoSave(newData);
    };

    const handleContentChange = (sectionId: string, newContent: any) => {
        if (!websiteData) return;
        const updated = {
            ...websiteData,
            sections: websiteData.sections.map((s) =>
                s.id === sectionId ? { ...s, content: newContent } : s
            ),
        };
        updateWebsiteData(updated);
    };

    const handleAiPrompt = async () => {
        if (!aiPrompt.trim() || !websiteData) return;
        setAiLoading(true);

        try {
            if (selectedSection) {
                // Rewrite selected section only
                const section = websiteData.sections.find((s) => s.id === selectedSection);
                if (!section) return;

                const res = await fetch("/api/ai/rewrite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ section: section.content, instruction: aiPrompt }),
                });

                if (res.ok) {
                    const data = await res.json();
                    handleContentChange(selectedSection, data.section);
                    updateSession({ tokens: data.tokensRemaining });
                    setAiPrompt("");
                } else {
                    const err = await res.json();
                    alert(err.error);
                }
            } else {
                // Regenerate entire website
                const res = await fetch("/api/ai/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: aiPrompt, category: project?.category || "business" }),
                });

                if (res.ok) {
                    const data = await res.json();
                    updateWebsiteData(data.website);
                    updateSession({ tokens: data.tokensRemaining });
                    setAiPrompt("");
                } else {
                    const err = await res.json();
                    alert(err.error);
                }
            }
        } finally {
            setAiLoading(false);
        }
    };

    const handleImprove = async (sectionId: string) => {
        if (!websiteData) return;
        setAiLoading(true);

        try {
            const section = websiteData.sections.find((s) => s.id === sectionId);
            if (!section) return;

            const res = await fetch("/api/ai/improve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ section: section.content }),
            });

            if (res.ok) {
                const data = await res.json();
                handleContentChange(sectionId, data.section);
                updateSession({ tokens: data.tokensRemaining });
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } finally {
            setAiLoading(false);
        }
    };

    const deleteSection = (sectionId: string) => {
        if (!websiteData) return;
        const updated = {
            ...websiteData,
            sections: websiteData.sections.filter((s) => s.id !== sectionId),
        };
        updateWebsiteData(updated);
        if (selectedSection === sectionId) setSelectedSection(null);
    };

    const addSection = (type: SectionType) => {
        if (!websiteData) return;
        const newSection = {
            id: `section-${Date.now()}`,
            type,
            content: getDefaultContent(type),
        };
        const updated = {
            ...websiteData,
            sections: [...websiteData.sections, newSection],
        };
        updateWebsiteData(updated);
        setShowAddSection(false);
    };

    const moveSection = (sectionId: string, direction: "up" | "down") => {
        if (!websiteData) return;
        const sections = [...websiteData.sections];
        const idx = sections.findIndex((s) => s.id === sectionId);
        if (idx === -1) return;
        if (direction === "up" && idx > 0) {
            [sections[idx], sections[idx - 1]] = [sections[idx - 1], sections[idx]];
        } else if (direction === "down" && idx < sections.length - 1) {
            [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
        }
        updateWebsiteData({ ...websiteData, sections });
    };

    const updateThemeColor = (key: string, value: string) => {
        if (!websiteData) return;
        updateWebsiteData({
            ...websiteData,
            theme: { ...websiteData.theme, [key]: value },
        });
    };

    if (loading) {
        return (
            <div className="loading-overlay" style={{ position: "fixed", background: "var(--bg-primary)" }}>
                <div className="spinner" />
                <p>Loading editor...</p>
            </div>
        );
    }

    return (
        <div className="editor-layout">
            {/* Left Sidebar */}
            <div className="editor-sidebar">
                <div className="editor-header">
                    <button className="btn btn-ghost btn-sm" onClick={() => router.push("/dashboard")}>
                        ← Back
                    </button>
                    <h3 style={{ flex: 1, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {project?.name || "Editor"}
                    </h3>
                    <span style={{ fontSize: "12px", color: saving ? "var(--warning)" : "var(--success)" }}>
                        {saving ? "Saving..." : "✓ Saved"}
                    </span>
                </div>

                <div className="editor-toolbar" style={{ flexDirection: "column", gap: "8px", padding: "12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            className={`btn btn-sm ${editMode ? "btn-primary" : "btn-secondary"}`}
                            style={{ flex: 1 }}
                            onClick={() => setEditMode(true)}
                        >
                            ✏️ Edit
                        </button>
                        <button
                            className={`btn btn-sm ${!editMode ? "btn-primary" : "btn-secondary"}`}
                            style={{ flex: 1 }}
                            onClick={() => setEditMode(false)}
                        >
                            👁️ Preview
                        </button>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setShowAddSection(true)}>
                            + Section
                        </button>
                        <button
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => window.open(`/preview/${projectId}`, "_blank")}
                        >
                            🔗 Preview
                        </button>
                    </div>
                </div>

                <div className="editor-sections">
                    <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", padding: "4px 16px", marginBottom: "8px" }}>
                        Sections
                    </div>
                    {websiteData?.sections.map((section, idx) => (
                        <div
                            key={section.id}
                            className={`editor-section-item ${selectedSection === section.id ? "active" : ""}`}
                            onClick={() => setSelectedSection(section.id)}
                        >
                            <div className="editor-section-icon">
                                {SECTION_ICONS[section.type] || "📄"}
                            </div>
                            <div className="editor-section-info">
                                <div className="editor-section-title">{section.type.replace("-", " ")}</div>
                                <div className="editor-section-type">Section {idx + 1}</div>
                            </div>
                            <div style={{ display: "flex", gap: "2px" }}>
                                <button className="btn btn-ghost" style={{ padding: "4px", fontSize: "12px" }} onClick={(e) => { e.stopPropagation(); moveSection(section.id, "up"); }}>↑</button>
                                <button className="btn btn-ghost" style={{ padding: "4px", fontSize: "12px" }} onClick={(e) => { e.stopPropagation(); moveSection(section.id, "down"); }}>↓</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Unified AI Prompt Bar */}
                <div className="ai-prompt-bar">
                    <div className="ai-prompt-context">
                        <span className="ai-prompt-icon">✨</span>
                        <span>
                            AI will update:{" "}
                            <strong>
                                {selectedSection
                                    ? websiteData?.sections.find((s) => s.id === selectedSection)?.type.replace("-", " ") || "Section"
                                    : "Full Website"}
                            </strong>
                        </span>
                        {selectedSection && (
                            <button
                                className="btn btn-ghost"
                                style={{ padding: "2px 6px", fontSize: "11px", marginLeft: "auto" }}
                                onClick={() => setSelectedSection(null)}
                                title="Deselect to target full website"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <div className="ai-prompt-input-row">
                        <textarea
                            ref={aiPromptRef}
                            className="input ai-prompt-textarea"
                            placeholder={selectedSection ? "e.g., Make it more professional..." : "e.g., Create a restaurant website..."}
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAiPrompt();
                                }
                            }}
                            disabled={aiLoading}
                        />
                        <button
                            className="btn btn-primary ai-prompt-submit"
                            onClick={handleAiPrompt}
                            disabled={aiLoading || !aiPrompt.trim()}
                            title={selectedSection ? "Rewrite section (2 tokens)" : "Generate website (5 tokens)"}
                        >
                            {aiLoading ? (
                                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                            ) : (
                                "🤖"
                            )}
                        </button>
                    </div>
                    <div className="ai-prompt-cost">
                        Cost: {selectedSection ? "2 tokens (section)" : "5 tokens (full site)"} · Press Enter to send
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className={`editor-canvas ${editMode ? "edit-mode" : "preview-mode"}`}>
                {websiteData ? (
                    <WebsiteRenderer
                        data={websiteData}
                        editMode={editMode}
                        selectedSection={selectedSection}
                        onSectionClick={setSelectedSection}
                        onContentChange={handleContentChange}
                    />
                ) : (
                    <div style={{ padding: "80px 20px", textAlign: "center", color: "#666" }}>
                        <p style={{ fontSize: "48px", marginBottom: "16px" }}>🎨</p>
                        <h3>No content yet</h3>
                        <p>Click &quot;Regenerate&quot; to create website content with AI</p>
                    </div>
                )}
            </div>

            {/* Right Panel */}
            {editMode && selectedSection && websiteData && (
                <div className="editor-panel">
                    <h4>Section Actions</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                        <button className="btn btn-primary btn-sm" onClick={() => { aiPromptRef.current?.focus(); }}>
                            ✨ AI Rewrite
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleImprove(selectedSection)}>
                            📝 Improve Content
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteSection(selectedSection)}>
                            🗑️ Delete Section
                        </button>
                    </div>

                    <h4>Theme Colors</h4>
                    {websiteData.theme && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[
                                { key: "primaryColor", label: "Primary" },
                                { key: "secondaryColor", label: "Secondary" },
                                { key: "accentColor", label: "Accent" },
                                { key: "backgroundColor", label: "Background" },
                                { key: "textColor", label: "Text" },
                            ].map(({ key, label }) => (
                                <div key={key} className="color-picker-wrapper">
                                    <input
                                        type="color"
                                        className="color-swatch"
                                        value={(websiteData.theme as any)[key] || "#000000"}
                                        onChange={(e) => updateThemeColor(key, e.target.value)}
                                        style={{ cursor: "pointer", border: "none" }}
                                    />
                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}



            {/* Add Section Modal */}
            {showAddSection && (
                <div className="modal-overlay" onClick={() => setShowAddSection(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>+ Add Section</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {SECTION_TYPES.map(({ type, label }) => (
                                <button
                                    key={type}
                                    className="btn btn-secondary"
                                    style={{ justifyContent: "flex-start", padding: "16px" }}
                                    onClick={() => addSection(type)}
                                >
                                    <span style={{ fontSize: "20px" }}>{SECTION_ICONS[type]}</span>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {aiLoading && (
                <div className="loading-overlay">
                    <div className="spinner" />
                    <p>🤖 AI is working its magic...</p>
                </div>
            )}
        </div>
    );
}

function getDefaultContent(type: SectionType) {
    const defaults: Record<string, any> = {
        hero: { headline: "Your Headline Here", subheadline: "Your subheadline goes here", ctaText: "Get Started", ctaLink: "#", backgroundImage: "", overlayOpacity: 0.5 },
        features: { title: "Our Features", subtitle: "What makes us special", items: [{ icon: "⭐", title: "Feature 1", description: "Description here" }, { icon: "🚀", title: "Feature 2", description: "Description here" }, { icon: "💡", title: "Feature 3", description: "Description here" }] },
        pricing: { title: "Pricing Plans", subtitle: "Choose your plan", plans: [{ name: "Basic", price: "$9", period: "/month", features: ["Feature 1", "Feature 2"], ctaText: "Get Started", highlighted: false }, { name: "Pro", price: "$29", period: "/month", features: ["Everything in Basic", "Feature 3", "Feature 4"], ctaText: "Get Started", highlighted: true }] },
        about: { title: "About Us", description: "Tell your story here.", image: "", stats: [{ value: "100+", label: "Clients" }, { value: "50+", label: "Projects" }] },
        contact: { title: "Contact Us", subtitle: "Get in touch", email: "hello@example.com", phone: "+1 (555) 000-0000", address: "123 Main St", formFields: [{ label: "Name", type: "text", placeholder: "Your name" }, { label: "Email", type: "email", placeholder: "Your email" }, { label: "Message", type: "textarea", placeholder: "Your message" }] },
        services: { title: "Our Services", subtitle: "What we offer", items: [{ icon: "🛠️", title: "Service 1", description: "Description", price: "$99" }] },
        "product-grid": { title: "Our Products", subtitle: "Browse our collection", products: [{ name: "Product 1", price: "$29.99", image: "", description: "Great product", badge: "New" }] },
        "menu-card": { title: "Our Menu", subtitle: "Delicious options", categories: [{ name: "Main Courses", items: [{ name: "Dish 1", description: "Tasty dish", price: "$15", image: "" }] }] },
    };
    return defaults[type] || {};
}
