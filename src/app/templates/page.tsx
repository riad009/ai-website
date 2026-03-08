"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WebsiteRenderer from "@/components/renderer/WebsiteRenderer";
import { CATEGORIES } from "@/lib/schemas";
import { TEMPLATES } from "@/lib/templates-data";

export default function TemplatesPage() {
    const { data: session } = useSession();
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [loading, setLoading] = useState(false);

    const filteredTemplates = selectedCategory === "all"
        ? TEMPLATES
        : TEMPLATES.filter((t) => t.category === selectedCategory);

    const useTemplate = async (template: typeof TEMPLATES[0]) => {
        setLoading(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: template.name,
                    category: template.category,
                    content: template.content,
                }),
            });

            if (res.ok) {
                const project = await res.json();
                window.location.href = `/editor/${project.id}`;
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.error || `Failed to create project (${res.status})`);
            }
        } catch (err) {
            alert("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<typeof TEMPLATES[0] | null>(null);

    return (
        <DashboardLayout>
            {/* Full-screen preview modal */}
            {previewTemplate && (
                <div className="tpl-preview-modal">
                    <div className="tpl-preview-modal-header">
                        <div className="tpl-preview-modal-title">
                            <span style={{ fontSize: 18 }}>👁️</span>
                            Previewing: {previewTemplate.name}
                        </div>
                        <div className="tpl-preview-modal-actions">
                            <button
                                className="tpl-card-use-btn"
                                onClick={() => {
                                    setPreviewTemplate(null);
                                    useTemplate(previewTemplate);
                                }}
                                disabled={loading}
                            >
                                🚀 Use This Template
                            </button>
                            <button
                                className="tpl-preview-modal-close"
                                onClick={() => setPreviewTemplate(null)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <div className="tpl-preview-modal-body">
                        <WebsiteRenderer data={previewTemplate.content as any} editMode={false} />
                    </div>
                </div>
            )}

            {/* Hero header */}
            <div className="tpl-hero">
                <div className="tpl-hero-glow" />
                <span className="tpl-hero-badge">✨ Starter Templates</span>
                <h1 className="tpl-hero-title">Choose a Template</h1>
                <p className="tpl-hero-sub">
                    Pick a professionally designed template and customize it with AI in seconds.
                </p>
            </div>

            {/* Category filter */}
            <div className="tpl-filters">
                <button
                    className={`tpl-filter-btn ${selectedCategory === "all" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("all")}
                >
                    <span className="tpl-filter-icon">🌐</span>
                    All
                    <span className="tpl-filter-count">{TEMPLATES.length}</span>
                </button>
                {CATEGORIES.map((cat) => {
                    const count = TEMPLATES.filter((t) => t.category === cat.value).length;
                    return (
                        <button
                            key={cat.value}
                            className={`tpl-filter-btn ${selectedCategory === cat.value ? "active" : ""}`}
                            onClick={() => setSelectedCategory(cat.value)}
                        >
                            <span className="tpl-filter-icon">{cat.icon}</span>
                            {cat.label}
                            <span className="tpl-filter-count">{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Gallery grid */}
            <div className="tpl-gallery">
                {filteredTemplates.map((template) => {
                    const cat = CATEGORIES.find((c) => c.value === template.category);
                    const isHovered = hoveredId === template.id;
                    return (
                        <div
                            key={template.id}
                            className={`tpl-card ${isHovered ? "hovered" : ""}`}
                            onMouseEnter={() => setHoveredId(template.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            {/* Live preview */}
                            <div className="tpl-card-preview">
                                <div className="tpl-card-preview-inner">
                                    <WebsiteRenderer data={template.content as any} editMode={false} />
                                </div>
                                {/* Overlay on hover */}
                                <div className="tpl-card-overlay">
                                    <button
                                        className="tpl-card-use-btn"
                                        onClick={() => useTemplate(template)}
                                        disabled={loading}
                                    >
                                        <span className="tpl-card-use-icon">🚀</span>
                                        Use This Template
                                    </button>
                                    <button
                                        className="tpl-card-preview-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewTemplate(template);
                                        }}
                                    >
                                        Preview
                                    </button>
                                </div>
                                {/* Gradient fade at bottom */}
                                <div className="tpl-card-fade" />
                            </div>

                            {/* Card info */}
                            <div className="tpl-card-body">
                                <div className="tpl-card-meta">
                                    <span className="tpl-card-badge">
                                        {cat?.icon} {cat?.label || template.category}
                                    </span>
                                </div>
                                <h3 className="tpl-card-title">{template.name}</h3>
                                <p className="tpl-card-desc">{template.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {filteredTemplates.length === 0 && (
                <div className="tpl-empty">
                    <span style={{ fontSize: 48 }}>🔍</span>
                    <h3>No templates in this category</h3>
                    <p>Try selecting a different category above.</p>
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner" />
                    <p>Creating project from template...</p>
                </div>
            )}
        </DashboardLayout>
    );
}
