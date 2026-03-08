"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CATEGORIES } from "@/lib/schemas";

interface Project {
    id: string;
    name: string;
    category: string;
    thumbnail: string | null;
    createdAt: string;
    updatedAt: string;
}

interface AIQuestion {
    id: string;
    question: string;
    type: "select" | "text" | "toggle";
    options?: string[];
    placeholder?: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newCategory, setNewCategory] = useState("auto");
    const [newPrompt, setNewPrompt] = useState("");
    const [generating, setGenerating] = useState(false);
    const [renameId, setRenameId] = useState<string | null>(null);
    const [renameName, setRenameName] = useState("");

    // Multi-step modal state
    const [modalStep, setModalStep] = useState<1 | 2>(1);
    const [questions, setQuestions] = useState<AIQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        if (!newPrompt.trim()) return;
        setLoadingQuestions(true);

        try {
            const res = await fetch("/api/ai/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: newPrompt }),
            });

            if (res.ok) {
                const data = await res.json();
                setQuestions(data.questions || []);
                // Initialize answers with defaults
                const defaultAnswers: Record<string, string> = {};
                (data.questions || []).forEach((q: AIQuestion) => {
                    if (q.type === "toggle") defaultAnswers[q.question] = "Yes";
                    else if (q.type === "select" && q.options?.[0]) defaultAnswers[q.question] = q.options[0];
                    else defaultAnswers[q.question] = "";
                });
                setAnswers(defaultAnswers);
                setModalStep(2);
            } else {
                // If questions fail, proceed directly to generation
                createProject();
            }
        } catch {
            // If questions fail, proceed directly to generation
            createProject();
        } finally {
            setLoadingQuestions(false);
        }
    };

    const createProject = async () => {
        if (!newName.trim()) return;
        setGenerating(true);

        try {
            let content = {};

            if (newPrompt.trim()) {
                // Build answers map for the API (only non-empty answers)
                const filteredAnswers: Record<string, string> = {};
                Object.entries(answers).forEach(([question, answer]) => {
                    if (answer && answer.trim()) {
                        filteredAnswers[question] = answer;
                    }
                });

                const aiRes = await fetch("/api/ai/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: newPrompt,
                        category: newCategory,
                        answers: Object.keys(filteredAnswers).length > 0 ? filteredAnswers : undefined,
                    }),
                });

                if (aiRes.ok) {
                    const aiData = await aiRes.json();
                    content = aiData.website;
                } else {
                    const err = await aiRes.json();
                    alert(err.error || "AI generation failed");
                    setGenerating(false);
                    return;
                }
            }

            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, category: newCategory, content }),
            });

            if (res.ok) {
                const project = await res.json();
                closeModal();
                router.push(`/editor/${project.id}`);
            }
        } catch {
            alert("Failed to create project");
        } finally {
            setGenerating(false);
        }
    };

    const closeModal = () => {
        setShowNewModal(false);
        setNewName("");
        setNewPrompt("");
        setModalStep(1);
        setQuestions([]);
        setAnswers({});
    };

    const deleteProject = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
        if (res.ok) {
            setProjects(projects.filter((p) => p.id !== id));
        }
    };

    const renameProject = async () => {
        if (!renameId || !renameName.trim()) return;

        const res = await fetch(`/api/projects/${renameId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: renameName }),
        });

        if (res.ok) {
            setProjects(projects.map((p) =>
                p.id === renameId ? { ...p, name: renameName } : p
            ));
            setRenameId(null);
            setRenameName("");
        }
    };

    const getCategoryIcon = (cat: string) => {
        return CATEGORIES.find((c) => c.value === cat)?.icon || "🌐";
    };

    const handleNextStep = () => {
        if (newPrompt.trim()) {
            fetchQuestions();
        } else {
            createProject();
        }
    };

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Projects</h1>
                    <p className="page-subtitle">Create and manage your AI-generated websites</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
                    + New Project
                </button>
            </div>

            {loading ? (
                <div className="empty-state">
                    <div className="spinner" style={{ margin: "0 auto" }} />
                </div>
            ) : (
                <div className="projects-grid">
                    <div className="new-project-card" onClick={() => setShowNewModal(true)}>
                        <div className="icon">+</div>
                        <span>Create New Project</span>
                    </div>

                    {projects.map((project) => (
                        <div key={project.id} className="project-card">
                            <div
                                className="project-thumbnail"
                                onClick={() => router.push(`/editor/${project.id}`)}
                            >
                                {getCategoryIcon(project.category)}
                            </div>
                            <div className="project-info">
                                <div className="project-name">{project.name}</div>
                                <div className="project-meta">
                                    <span className="project-category">
                                        {getCategoryIcon(project.category)} {project.category}
                                    </span>
                                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="project-actions">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ flex: 1 }}
                                    onClick={() => router.push(`/editor/${project.id}`)}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                        setRenameId(project.id);
                                        setRenameName(project.name);
                                    }}
                                >
                                    ✏️
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => deleteProject(project.id)}
                                    style={{ color: "var(--danger)" }}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Project Modal — Multi-Step */}
            {showNewModal && (
                <div className="modal-overlay" onClick={() => !generating && !loadingQuestions && closeModal()}>
                    <div className="modal modal-questions" onClick={(e) => e.stopPropagation()}>
                        {/* Step Indicator */}
                        {newPrompt.trim() && (
                            <div className="step-indicator">
                                <div className={`step-dot ${modalStep >= 1 ? "active" : ""}`}>1</div>
                                <div className="step-line" />
                                <div className={`step-dot ${modalStep >= 2 ? "active" : ""}`}>2</div>
                            </div>
                        )}

                        {modalStep === 1 && (
                            <>
                                <h2>✨ Create New Project</h2>
                                <div className="auth-form">
                                    <div className="input-group">
                                        <label>Project Name</label>
                                        <input
                                            className="input"
                                            placeholder="My Awesome Website"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Category</label>
                                        <select className="input" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.icon} {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>AI Prompt (optional)</label>
                                        <textarea
                                            className="input"
                                            placeholder="Describe your website... e.g., 'A modern fitness gym website called PowerFit with classes, pricing, and testimonials'"
                                            value={newPrompt}
                                            onChange={(e) => setNewPrompt(e.target.value)}
                                            rows={4}
                                        />
                                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                            Leave blank to start with a template, or describe your website for AI generation (costs 5 tokens)
                                        </span>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button className="btn btn-secondary" onClick={closeModal} disabled={loadingQuestions}>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleNextStep}
                                        disabled={loadingQuestions || !newName.trim()}
                                    >
                                        {loadingQuestions ? (
                                            <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing prompt...</>
                                        ) : newPrompt.trim() ? (
                                            "Next: Smart Questions →"
                                        ) : (
                                            "Create Project"
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {modalStep === 2 && (
                            <div className="questions-step">
                                <h2>🧠 Help us build the perfect website</h2>
                                <p className="questions-subtitle">
                                    Answer these questions so the AI can tailor your website to your exact needs.
                                </p>

                                <div className="questions-list">
                                    {questions.map((q, index) => (
                                        <div key={q.id} className="question-card" style={{ animationDelay: `${index * 0.08}s` }}>
                                            <label className="question-label">
                                                <span className="question-number">{index + 1}</span>
                                                {q.question}
                                            </label>

                                            {q.type === "select" && q.options && (
                                                <div className="question-options">
                                                    {q.options.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            className={`option-chip ${answers[q.question] === opt ? "selected" : ""}`}
                                                            onClick={() => setAnswers({ ...answers, [q.question]: opt })}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === "toggle" && (
                                                <div className="question-toggle-group">
                                                    <button
                                                        className={`toggle-btn ${answers[q.question] === "Yes" ? "selected yes" : ""}`}
                                                        onClick={() => setAnswers({ ...answers, [q.question]: "Yes" })}
                                                    >
                                                        ✓ Yes
                                                    </button>
                                                    <button
                                                        className={`toggle-btn ${answers[q.question] === "No" ? "selected no" : ""}`}
                                                        onClick={() => setAnswers({ ...answers, [q.question]: "No" })}
                                                    >
                                                        ✕ No
                                                    </button>
                                                </div>
                                            )}

                                            {q.type === "text" && (
                                                <input
                                                    className="input question-text-input"
                                                    placeholder={q.placeholder || "Type your answer..."}
                                                    value={answers[q.question] || ""}
                                                    onChange={(e) => setAnswers({ ...answers, [q.question]: e.target.value })}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="modal-actions">
                                    <button className="btn btn-secondary" onClick={() => setModalStep(1)} disabled={generating}>
                                        ← Back
                                    </button>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => { setAnswers({}); createProject(); }}
                                        disabled={generating}
                                    >
                                        Skip questions
                                    </button>
                                    <button className="btn btn-primary" onClick={createProject} disabled={generating}>
                                        {generating ? (
                                            <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating...</>
                                        ) : (
                                            "🤖 Generate with AI"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {renameId && (
                <div className="modal-overlay" onClick={() => setRenameId(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Rename Project</h2>
                        <div className="input-group">
                            <label>New Name</label>
                            <input
                                className="input"
                                value={renameName}
                                onChange={(e) => setRenameName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && renameProject()}
                                autoFocus
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setRenameId(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={renameProject}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {generating && (
                <div className="loading-overlay">
                    <div className="spinner" />
                    <p>🤖 AI is building your website...</p>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>This usually takes 10-20 seconds</p>
                </div>
            )}
        </DashboardLayout>
    );
}

