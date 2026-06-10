"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CATEGORIES } from "@/lib/schemas";

const AVAILABLE_MODELS = [
    { id: "claude-opus-4-8", label: "Claude Opus 4.8", description: "Most capable — best design", icon: "🧠" },
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", description: "Fast & powerful", icon: "⚡" },
    { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", description: "Fastest & cheapest", icon: "🚀" },
];

// Design options — these feed directly into the AI prompt so every site comes out
// distinct. Each option group is optional; "Surprise me" lets the AI choose.
interface DesignChoice { label: string; value: string; preview: string; desc: string }
interface DesignGroup { id: string; title: string; icon: string; choices: DesignChoice[] }

const SURPRISE: DesignChoice = { label: "Surprise me", value: "", preview: "🎲", desc: "Let the AI decide" };

const DESIGN_GROUPS: DesignGroup[] = [
    {
        id: "style", title: "Visual Style", icon: "🎨", choices: [
            SURPRISE,
            { label: "Dark Luxury", value: "Dark Luxury — deep blacks (#0a0a0a), gold/amber accents, serif display fonts, dramatic shadows, premium feel", preview: "🖤", desc: "Black + gold, premium" },
            { label: "Neon Cyber", value: "Neon Cyber — dark background, glowing cyan/magenta/lime neon accents, tech/futuristic feel, monospace touches", preview: "💜", desc: "Glowing, futuristic" },
            { label: "Soft Minimal", value: "Soft Minimal — off-white background, pastel accents, generous whitespace, thin borders, subtle shadows, calm and clean", preview: "🤍", desc: "Clean, airy, calm" },
            { label: "Bold Vibrant", value: "Bold Vibrant — saturated primary colors, extra-large bold typography (72-96px headlines), energetic gradients", preview: "🌈", desc: "Loud, energetic" },
            { label: "Earth Organic", value: "Earth Organic — warm browns, sage greens, cream backgrounds, natural rounded shapes, cozy", preview: "🌿", desc: "Warm, natural" },
            { label: "Ocean Fresh", value: "Ocean Fresh — deep blues, teal, white, wave-like clip-paths, fresh and trustworthy", preview: "🌊", desc: "Blue, fresh, trust" },
            { label: "Sunset Warm", value: "Sunset Warm — orange, pink, purple multi-color warm gradients, friendly and inviting", preview: "🌅", desc: "Warm gradients" },
            { label: "Glassmorphism", value: "Glassmorphism — heavy frosted-glass cards with backdrop-blur, translucent layers over colorful gradient backgrounds", preview: "🧊", desc: "Frosted glass" },
            { label: "Brutalist", value: "Neo-Brutalist — high contrast, thick black borders, hard offset shadows, raw bold blocks, oversized type", preview: "⬛", desc: "Raw, high-impact" },
            { label: "Editorial", value: "Editorial / Magazine — elegant serif headlines, asymmetric grid, large pull quotes, refined typographic hierarchy", preview: "📰", desc: "Magazine-like" },
        ],
    },
    {
        id: "mood", title: "Color Mood", icon: "🌈", choices: [
            SURPRISE,
            { label: "Cool Blues", value: "cool blue and indigo color palette", preview: "🔵", desc: "" },
            { label: "Warm Tones", value: "warm orange, red and amber palette", preview: "🟠", desc: "" },
            { label: "Purple/Violet", value: "purple and violet gradient palette", preview: "🟣", desc: "" },
            { label: "Green/Teal", value: "green and teal palette", preview: "🟢", desc: "" },
            { label: "Monochrome", value: "monochrome single-hue palette with many shades", preview: "⚫", desc: "" },
            { label: "Pink/Rose", value: "pink and rose palette", preview: "🌸", desc: "" },
        ],
    },
    {
        id: "layout", title: "Hero Layout", icon: "🧱", choices: [
            SURPRISE,
            { label: "Full-screen", value: "full-screen hero with a large background image and dark gradient overlay, centered headline", preview: "🖼️", desc: "" },
            { label: "Split 50/50", value: "split 50/50 hero — text on the left, a real photo with decorative frame on the right", preview: "◧", desc: "" },
            { label: "Centered", value: "centered hero with a big headline, animated underline and floating gradient orbs", preview: "🎯", desc: "" },
            { label: "Asymmetric", value: "asymmetric hero — text on 60%, overlapping stacked image cards on 40%", preview: "⬗", desc: "" },
            { label: "Bento Grid", value: "bento-grid hero/feature layout with mixed-size cards", preview: "🍱", desc: "" },
        ],
    },
    {
        id: "vibe", title: "Personality", icon: "✨", choices: [
            SURPRISE,
            { label: "Playful", value: "playful and fun tone with rounded shapes and lively micro-animations", preview: "🎈", desc: "" },
            { label: "Corporate", value: "professional corporate tone, trustworthy and polished", preview: "💼", desc: "" },
            { label: "Elegant", value: "elegant and luxurious tone, refined and high-end", preview: "💎", desc: "" },
            { label: "Energetic", value: "bold energetic tone with high contrast and motion", preview: "⚡", desc: "" },
            { label: "Calm", value: "calm and minimal tone, lots of breathing room", preview: "🍃", desc: "" },
        ],
    },
    {
        id: "fancy", title: "Fancy Effects", icon: "🪄", choices: [
            { label: "Animations", value: "rich scroll/entrance animations and hover micro-interactions on every element", preview: "🎬", desc: "On by default" },
            { label: "Gradient text", value: "gradient text on key headlines", preview: "🌗", desc: "" },
            { label: "Glow effects", value: "glowing accents and pulse-glow effects", preview: "💡", desc: "" },
            { label: "Floating orbs", value: "decorative floating gradient orbs and abstract blobs in the background", preview: "🫧", desc: "" },
            { label: "3D / depth", value: "layered depth with overlapping cards, large soft shadows and parallax feel", preview: "🧊", desc: "" },
            { label: "Animated gradient bg", value: "an animated shifting gradient background", preview: "🌌", desc: "" },
        ],
    },
];

const GENERATION_STEPS = [
    { icon: "🔗", label: "Connecting to AI" },
    { icon: "🧠", label: "AI is designing your website" },
    { icon: "🎨", label: "Layout & theme designed" },
    { icon: "🛠️", label: "Building sections" },
    { icon: "✨", label: "Finalizing your website" },
    { icon: "✅", label: "Website ready!" },
];

const AI_STEP_MESSAGES = [
    "Connecting to the AI model... Hold tight! 🚀",
    "Analyzing your requirements and choosing the perfect design style for your website...",
    "Great! I've designed the layout and picked a color palette that matches your vision. Now building the individual sections...",
    "",  // dynamic — filled with section detail
    "Almost there! Polishing the final details and making sure everything looks perfect...",
    "Your website is ready! 🎉 Redirecting you to the editor...",
];

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
    const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
    const [generating, setGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState(0);
    const [generationPercent, setGenerationPercent] = useState(0);
    const [generationDetail, setGenerationDetail] = useState("");
    const [generationMessages, setGenerationMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([])
    const chatEndRef = useRef<HTMLDivElement>(null);
    const lastStepRef = useRef(-1);
    const [renameId, setRenameId] = useState<string | null>(null);
    const [renameName, setRenameName] = useState("");

    // Multi-step modal state
    const [modalStep, setModalStep] = useState<1 | 2>(1);
    const [questions, setQuestions] = useState<AIQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    // Design choices: single-select groups map id -> value; "fancy" is multi-select.
    const [design, setDesign] = useState<Record<string, string>>({});
    const [fancy, setFancy] = useState<string[]>(["rich scroll/entrance animations and hover micro-interactions on every element"]);

    // Turn the design choices into a clear design brief for the AI.
    const buildDesignBrief = (): string => {
        const lines: string[] = [];
        DESIGN_GROUPS.forEach((g) => {
            if (g.id === "fancy") return;
            const val = design[g.id];
            if (val) lines.push(`- ${g.title}: ${val}`);
        });
        if (fancy.length > 0) lines.push(`- Fancy effects to include: ${fancy.join("; ")}`);
        return lines.length ? `DESIGN DIRECTION (follow these choices closely):\n${lines.join("\n")}` : "";
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Auto-scroll chat and push AI messages on step changes
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [generationMessages]);

    useEffect(() => {
        if (!generating) {
            lastStepRef.current = -1;
            return;
        }
        if (generationStep <= lastStepRef.current) return;
        lastStepRef.current = generationStep;

        let msg = AI_STEP_MESSAGES[generationStep] || "";
        // For step 3, use the dynamic detail
        if (generationStep === 3 && generationDetail) {
            msg = `Building your website sections — ${generationDetail}`;
        }
        if (msg) {
            setGenerationMessages(prev => [...prev, { role: "ai", text: msg }]);
        }
    }, [generationStep, generating, generationDetail]);

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

                // Reset progress state
                setGenerationStep(0);
                setGenerationPercent(5);
                setGenerationDetail("Starting...");
                lastStepRef.current = -1;
                setGenerationMessages([
                    { role: "user", text: newPrompt.trim() },
                    { role: "ai", text: `Got it! I'll create a ${newCategory !== 'auto' ? newCategory + ' ' : ''}website based on your description. Let me get started... 🎨` },
                ]);

                // Use streaming endpoint for real progress
                const aiRes = await fetch("/api/ai/generate-stream", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: newPrompt,
                        category: newCategory,
                        model: selectedModel,
                        answers: Object.keys(filteredAnswers).length > 0 ? filteredAnswers : undefined,
                        designBrief: buildDesignBrief() || undefined,
                    }),
                });

                if (!aiRes.ok) {
                    let errMsg = "AI generation failed";
                    try { const e = await aiRes.json(); errMsg = e.error || errMsg; } catch { }
                    alert(errMsg);
                    setGenerating(false);
                    return;
                }

                // Read SSE stream
                const reader = aiRes.body?.getReader();
                if (!reader) { alert("Streaming not supported"); setGenerating(false); return; }

                const decoder = new TextDecoder();
                let sseBuffer = "";
                let streamError: string | null = null;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    sseBuffer += decoder.decode(value, { stream: true });
                    const lines = sseBuffer.split("\n");
                    sseBuffer = lines.pop() || "";

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        try {
                            const event = JSON.parse(line.slice(6));
                            if (event.type === "progress") {
                                setGenerationStep(event.step);
                                setGenerationPercent(event.percent);
                                setGenerationDetail(event.detail);
                            } else if (event.type === "complete") {
                                content = event.website;
                                setGenerationStep(GENERATION_STEPS.length - 1);
                                setGenerationPercent(100);
                                setGenerationDetail("Done!");
                            } else if (event.type === "error") {
                                streamError = event.error;
                            }
                        } catch { }
                    }
                }

                if (streamError) {
                    alert(streamError);
                    setGenerating(false);
                    return;
                }

                if (!content || Object.keys(content).length === 0) {
                    alert("AI generation failed — no website data received");
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
            setGenerationStep(0);
            setGenerationPercent(0);
            setGenerationDetail("");
        }
    };

    const closeModal = () => {
        setShowNewModal(false);
        setNewName("");
        setNewPrompt("");
        setSelectedModel(AVAILABLE_MODELS[0].id);
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
                                        <label>AI Model</label>
                                        <div className="model-selector">
                                            {AVAILABLE_MODELS.map((m) => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    className={`model-option ${selectedModel === m.id ? "selected" : ""}`}
                                                    onClick={() => setSelectedModel(m.id)}
                                                >
                                                    <span className="model-option-icon">{m.icon}</span>
                                                    <div className="model-option-info">
                                                        <span className="model-option-name">{m.label}</span>
                                                        <span className="model-option-desc">{m.description}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
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
                                <h2>🎨 Design your website</h2>
                                <p className="questions-subtitle">
                                    Pick a look and feel — every choice makes your site more unique. Leave any on &quot;Surprise me&quot; to let the AI decide.
                                </p>

                                <div className="design-groups">
                                    {DESIGN_GROUPS.map((g) => (
                                        <div key={g.id} className="design-group">
                                            <div className="design-group-title">
                                                <span>{g.icon}</span> {g.title}
                                                {g.id === "fancy" && <span className="design-multi-hint">pick any</span>}
                                            </div>
                                            <div className="design-choices">
                                                {g.choices.map((c) => {
                                                    const isFancy = g.id === "fancy";
                                                    const selected = isFancy
                                                        ? fancy.includes(c.value)
                                                        : (design[g.id] ?? "") === c.value;
                                                    return (
                                                        <button
                                                            key={c.label}
                                                            type="button"
                                                            className={`design-chip ${selected ? "selected" : ""}`}
                                                            title={c.desc || c.label}
                                                            onClick={() => {
                                                                if (isFancy) {
                                                                    setFancy((prev) =>
                                                                        prev.includes(c.value)
                                                                            ? prev.filter((v) => v !== c.value)
                                                                            : [...prev, c.value]
                                                                    );
                                                                } else {
                                                                    setDesign((prev) => ({ ...prev, [g.id]: c.value }));
                                                                }
                                                            }}
                                                        >
                                                            <span className="design-chip-emoji">{c.preview}</span>
                                                            <span className="design-chip-label">{c.label}</span>
                                                            {c.desc && <span className="design-chip-desc">{c.desc}</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {questions.length > 0 && (
                                    <p className="questions-subtitle" style={{ marginTop: 8 }}>
                                        A few smart questions so the AI can tailor the content:
                                    </p>
                                )}

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
                <div className="generation-overlay">
                    <div className="generation-split-layout">
                        {/* Left Panel — Chat + Progress */}
                        <div className="generation-left-panel">
                            <div className="generation-left-inner">
                                <div className="generation-header">
                                    <div className="generation-icon-pulse">
                                        <span>🤖</span>
                                    </div>
                                    <h3>Building Your Website</h3>
                                    <p className="generation-model-badge">
                                        {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.icon}{" "}
                                        {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.label}
                                    </p>
                                </div>

                                <div className="generation-progress-bar-track">
                                    <div
                                        className="generation-progress-bar-fill"
                                        style={{ width: `${generationPercent}%` }}
                                    />
                                </div>
                                <div className="generation-percentage">
                                    {generationPercent}%
                                </div>

                                {/* Chat conversation */}
                                <div className="generation-chat">
                                    {generationMessages.map((msg, i) => (
                                        <div key={i} className={`gen-chat-msg ${msg.role}`}>
                                            <div className="gen-chat-avatar">
                                                {msg.role === "user" ? "👤" : "🤖"}
                                            </div>
                                            <div className="gen-chat-bubble">
                                                <div className="gen-chat-role">{msg.role === "user" ? "You" : "AI Assistant"}</div>
                                                <div className="gen-chat-text">{msg.text}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Typing indicator when AI is working */}
                                    {generationPercent < 100 && (
                                        <div className="gen-chat-msg ai">
                                            <div className="gen-chat-avatar">🤖</div>
                                            <div className="gen-chat-bubble">
                                                <div className="gen-chat-typing">
                                                    <span /><span /><span />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <p className="generation-footer">This usually takes 15-30 seconds</p>
                            </div>
                        </div>

                        {/* Right Panel — Skeleton Website Preview */}
                        <div className="generation-right-panel">
                            <div className="skeleton-browser-bar">
                                <div className="skeleton-browser-dots">
                                    <span /><span /><span />
                                </div>
                                <div className="skeleton-browser-url">
                                    <span>🔒</span> mywebsite.siteforge.ai
                                </div>
                            </div>
                            <div className="skeleton-website">
                                {/* Skeleton Navbar — always visible */}
                                <div className={`skeleton-section skeleton-navbar ${generationStep >= 0 ? "visible" : ""}`}>
                                    <div className="skeleton-block skeleton-logo" />
                                    <div className="skeleton-nav-links">
                                        <div className="skeleton-block skeleton-nav-link" />
                                        <div className="skeleton-block skeleton-nav-link" />
                                        <div className="skeleton-block skeleton-nav-link" />
                                        <div className="skeleton-block skeleton-nav-btn" />
                                    </div>
                                </div>

                                {/* Skeleton Hero — step 1+ */}
                                <div className={`skeleton-section skeleton-hero ${generationStep >= 1 ? "visible" : ""}`}>
                                    <div className="skeleton-hero-content">
                                        <div className="skeleton-block skeleton-hero-badge" />
                                        <div className="skeleton-block skeleton-hero-title" />
                                        <div className="skeleton-block skeleton-hero-title-2" />
                                        <div className="skeleton-block skeleton-hero-subtitle" />
                                        <div className="skeleton-hero-btns">
                                            <div className="skeleton-block skeleton-hero-btn" />
                                            <div className="skeleton-block skeleton-hero-btn-outline" />
                                        </div>
                                    </div>
                                    <div className="skeleton-block skeleton-hero-image" />
                                </div>

                                {/* Skeleton Features — step 2+ */}
                                <div className={`skeleton-section skeleton-features ${generationStep >= 2 ? "visible" : ""}`}>
                                    <div className="skeleton-block skeleton-section-title" />
                                    <div className="skeleton-block skeleton-section-subtitle" />
                                    <div className="skeleton-features-grid">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="skeleton-feature-card" style={{ animationDelay: `${i * 0.15}s` }}>
                                                <div className="skeleton-block skeleton-feature-icon" />
                                                <div className="skeleton-block skeleton-feature-title" />
                                                <div className="skeleton-block skeleton-feature-text" />
                                                <div className="skeleton-block skeleton-feature-text-2" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skeleton Testimonials — step 3+ */}
                                <div className={`skeleton-section skeleton-testimonials ${generationStep >= 3 ? "visible" : ""}`}>
                                    <div className="skeleton-block skeleton-section-title" />
                                    <div className="skeleton-testimonials-grid">
                                        {[0, 1].map(i => (
                                            <div key={i} className="skeleton-testimonial-card" style={{ animationDelay: `${i * 0.2}s` }}>
                                                <div className="skeleton-block skeleton-testimonial-text" />
                                                <div className="skeleton-testimonial-author">
                                                    <div className="skeleton-block skeleton-avatar" />
                                                    <div className="skeleton-testimonial-info">
                                                        <div className="skeleton-block skeleton-author-name" />
                                                        <div className="skeleton-block skeleton-author-role" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skeleton CTA — step 4+ */}
                                <div className={`skeleton-section skeleton-cta ${generationStep >= 4 ? "visible" : ""}`}>
                                    <div className="skeleton-block skeleton-cta-title" />
                                    <div className="skeleton-block skeleton-cta-subtitle" />
                                    <div className="skeleton-block skeleton-cta-btn" />
                                </div>

                                {/* Skeleton Footer — step 5 */}
                                <div className={`skeleton-section skeleton-footer ${generationStep >= 5 ? "visible" : ""}`}>
                                    <div className="skeleton-footer-cols">
                                        <div className="skeleton-footer-col">
                                            <div className="skeleton-block skeleton-footer-logo" />
                                            <div className="skeleton-block skeleton-footer-text" />
                                        </div>
                                        <div className="skeleton-footer-col">
                                            <div className="skeleton-block skeleton-footer-heading" />
                                            <div className="skeleton-block skeleton-footer-link" />
                                            <div className="skeleton-block skeleton-footer-link" />
                                            <div className="skeleton-block skeleton-footer-link" />
                                        </div>
                                        <div className="skeleton-footer-col">
                                            <div className="skeleton-block skeleton-footer-heading" />
                                            <div className="skeleton-block skeleton-footer-link" />
                                            <div className="skeleton-block skeleton-footer-link" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

