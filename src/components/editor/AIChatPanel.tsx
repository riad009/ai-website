"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/lib/editor-store";
import type { ComponentData } from "@/types/editor";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

export default function AIChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { components, replaceAllComponents } = useEditorStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Convert editor ComponentData[] → WebsiteData format for the AI
    const buildWebsiteJson = () => {
        return {
            sections: components.map((c: ComponentData) => ({
                id: c.id,
                type: c.type,
                content: c.props || {},
            })),
        };
    };

    // Convert AI WebsiteData response → ComponentData[] for the editor
    const applyWebsiteJson = (website: any) => {
        if (!website?.sections) return;

        const newComponents: ComponentData[] = website.sections.map((s: any) => ({
            id: s.id || `comp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: s.type,
            props: s.content || {},
        }));

        replaceAllComponents(newComponents);
    };

    const buildHistory = (): Array<{ role: "user" | "assistant"; content: string }> => {
        // Send last 6 messages as context (to keep token usage reasonable)
        return messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
        }));
    };

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg: ChatMessage = {
            role: "user",
            content: trimmed,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/ai/chat-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmed,
                    history: buildHistory(),
                    currentWebsite: buildWebsiteJson(),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                const errorMsg: ChatMessage = {
                    role: "assistant",
                    content: err.error || "Something went wrong. Please try again.",
                    timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, errorMsg]);
                return;
            }

            const data = await res.json();

            // Apply the updated website
            if (data.website) {
                applyWebsiteJson(data.website);
            }

            const assistantMsg: ChatMessage = {
                role: "assistant",
                content: data.message || "Done! I've updated the website.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
        } catch {
            const errorMsg: ChatMessage = {
                role: "assistant",
                content: "Network error. Please check your connection and try again.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="ai-chat-panel">
            <div className="ai-chat-header">
                <div className="ai-chat-header-left">
                    <span className="ai-chat-icon">🤖</span>
                    <span className="ai-chat-title">AI Assistant</span>
                </div>
                <button className="ai-chat-close" onClick={onClose} title="Close">✕</button>
            </div>

            <div className="ai-chat-messages">
                {messages.length === 0 && (
                    <div className="ai-chat-empty">
                        <div className="ai-chat-empty-icon">✨</div>
                        <h4>AI Website Editor</h4>
                        <p>Give instructions to modify your website. I remember our conversation, so you can iterate naturally.</p>
                        <div className="ai-chat-suggestions">
                            <button onClick={() => setInput("Change the hero headline to something more catchy")}>
                                ✏️ Change hero headline
                            </button>
                            <button onClick={() => setInput("Add a testimonials section with 3 reviews")}>
                                ➕ Add testimonials
                            </button>
                            <button onClick={() => setInput("Change the color scheme to dark mode")}>
                                🎨 Switch to dark mode
                            </button>
                            <button onClick={() => setInput("Add a FAQ section with 5 questions")}>
                                ❓ Add FAQ section
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`ai-chat-msg ${msg.role}`}>
                        <div className="ai-chat-msg-avatar">
                            {msg.role === "user" ? "👤" : "🤖"}
                        </div>
                        <div className="ai-chat-msg-content">
                            <div className="ai-chat-msg-text">{msg.content}</div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="ai-chat-msg assistant">
                        <div className="ai-chat-msg-avatar">🤖</div>
                        <div className="ai-chat-msg-content">
                            <div className="ai-chat-msg-text ai-chat-typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="ai-chat-input-area">
                <textarea
                    className="ai-chat-input"
                    placeholder="Tell me what to change..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    rows={2}
                    disabled={loading}
                />
                <button
                    className="ai-chat-send"
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                >
                    {loading ? (
                        <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    ) : (
                        "↑"
                    )}
                </button>
            </div>
        </div>
    );
}
