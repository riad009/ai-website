"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditorStore, newComponentId, COMPONENT_REGISTRY } from "@/lib/editor-store";
import type { ComponentData } from "@/types/editor";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ComponentLibraryProps {
  onAdd: (type: string) => void;
}

const SESSION_KEY = "ai-chat-messages";

function loadMessages(): ChatMessage[] {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: ChatMessage[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(msgs));
  } catch { }
}

export default function ComponentLibrary({ onAdd }: ComponentLibraryProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { replaceAllComponents, components, selectedComponentIds, clearSelection, selectedMicroElement, setMicroElement } = useEditorStore();

  // Load messages from sessionStorage on mount
  useEffect(() => {
    setMessages(loadMessages());
    setMounted(true);
  }, []);

  // Save messages to sessionStorage and scroll on change
  useEffect(() => {
    if (mounted) saveMessages(messages);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mounted]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const hasWebsite = components.length > 0;

  // Get selected components info
  const selectedComponents = selectedComponentIds
    .map((id) => components.find((c) => c.id === id))
    .filter(Boolean) as ComponentData[];

  const getComponentLabel = (comp: ComponentData) => {
    if (comp.type === "custom" && comp.props?.sectionLabel) return comp.props.sectionLabel;
    const def = COMPONENT_REGISTRY.find((c) => c.type === comp.type);
    return def?.label || comp.type;
  };

  const getComponentIcon = (comp: ComponentData) => {
    const def = COMPONENT_REGISTRY.find((c) => c.type === comp.type);
    return def?.icon || "📦";
  };

  const buildWebsiteJson = () => ({
    sections: components.map((c: ComponentData) => ({
      id: c.id,
      type: c.type,
      content: c.props || {},
    })),
  });

  const applyWebsiteJson = (website: any) => {
    if (!website?.sections) return;
    const newComponents: ComponentData[] = website.sections.map((s: any) => ({
      id: s.id || newComponentId(),
      type: s.type,
      props: s.content || {},
    }));
    replaceAllComponents(newComponents);
  };

  const buildHistory = (): Array<{ role: "user" | "assistant"; content: string }> =>
    messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Build targeted instruction with selected sections and micro-element
    let instruction = trimmed;
    if (selectedComponents.length > 0) {
      const sectionLabels = selectedComponents.map((c) => `${c.id} (${getComponentLabel(c)})`);
      instruction = `[TARGET SECTIONS: ${sectionLabels.join(", ")}]`;
      if (selectedMicroElement) {
        instruction += ` [TARGET ELEMENT: ${selectedMicroElement.tag} "${selectedMicroElement.text}"]`;
      }
      instruction += ` ${trimmed}`;
    }

    const userMsg: ChatMessage = { role: "user", content: trimmed, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setProgressStatus("Analyzing your request...");

    // Progress status cycling
    const editSteps = [
      "Analyzing your request...",
      "Understanding website structure...",
      "Generating changes...",
      "Building updated sections...",
      "Applying modifications...",
      "Polishing design...",
    ];
    const createSteps = [
      "Understanding your vision...",
      "Designing layout...",
      "Creating sections...",
      "Adding content...",
      "Styling components...",
      "Finalizing website...",
    ];
    const steps = hasWebsite ? editSteps : createSteps;
    let stepIdx = 0;
    const progressTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setProgressStatus(steps[stepIdx]);
    }, 2500);

    try {
      if (!hasWebsite) {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: trimmed, category: "auto" }),
        });

        if (!res.ok) {
          const data = await res.json();
          addAssistantMessage(data.error || "Generation failed. Please try again.");
          return;
        }

        const data = await res.json();
        const comps: ComponentData[] = (data.website?.sections || []).map((s: any) => ({
          id: s.id || newComponentId(),
          type: s.type,
          props: s.content || {},
        }));

        if (comps.length > 0) {
          replaceAllComponents(comps);
          addAssistantMessage("✨ Website created! Click Select in the toolbar, then click sections to select them.");
        } else {
          addAssistantMessage("No sections returned. Please try a different description.");
        }
      } else {
        const res = await fetch("/api/ai/chat-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: instruction,
            history: buildHistory(),
            currentWebsite: buildWebsiteJson(),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          addAssistantMessage(err.error || "Something went wrong. Please try again.");
          return;
        }

        const data = await res.json();
        if (data.website) applyWebsiteJson(data.website);
        addAssistantMessage(data.message || "Done! Website updated.");
      }
    } catch {
      addAssistantMessage("Network error. Please check your connection.");
    } finally {
      clearInterval(progressTimer);
      setLoading(false);
      setProgressStatus("");
    }
  };

  const addAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content, timestamp: Date.now() }]);
  };

  const clearChat = () => {
    setMessages([]);
    saveMessages([]);
  };

  return (
    <div className="chat-sidebar">
      {/* Header */}
      <div className="chat-sidebar-header">
        <div className="chat-sidebar-title">
          <span className="chat-sidebar-icon">🤖</span>
          <span>AI Website Builder</span>
        </div>
        {messages.length > 0 && (
          <button className="chat-clear-btn" onClick={clearChat} title="Clear chat">
            🗑️
          </button>
        )}
      </div>

      {/* Selection Indicator — multi-select + micro-element */}
      {selectedComponents.length > 0 && hasWebsite && (
        <div className="chat-section-selected">
          <div className="chat-selection-content">
            <div className="chat-selection-pills">
              {selectedComponents.map((comp) => (
                <span key={comp.id} className="chat-selection-pill">
                  {getComponentIcon(comp)} {getComponentLabel(comp)}
                </span>
              ))}
            </div>
            {selectedMicroElement && (
              <div className="chat-micro-badge">
                🎯 <strong>{selectedMicroElement.tag}:</strong> "{selectedMicroElement.text}"
                <button className="chat-micro-clear" onClick={() => setMicroElement(null)}>✕</button>
              </div>
            )}
            <span className="chat-section-selected-hint">
              {selectedMicroElement ? "edits target this element" : `${selectedComponents.length} section${selectedComponents.length > 1 ? "s" : ""} selected`}
            </span>
          </div>
          <button
            className="chat-section-deselect"
            onClick={() => clearSelection()}
            title="Deselect all"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="chat-sidebar-messages">
        {messages.length === 0 && (
          <div className="chat-sidebar-empty">
            <div className="chat-sidebar-empty-icon">✨</div>
            <h4>{hasWebsite ? "Edit Your Website" : "Create Your Website"}</h4>
            <p>
              {hasWebsite
                ? "Click a section in the preview to select it, then describe your changes."
                : "Describe the website you want and I'll build it for you."}
            </p>
            <div className="chat-sidebar-suggestions">
              {hasWebsite ? (
                <>
                  <button onClick={() => setInput("Change the hero headline to something more catchy")}>
                    ✏️ Change headline
                  </button>
                  <button onClick={() => setInput("Switch to a dark color scheme")}>
                    🌙 Dark mode
                  </button>
                  <button onClick={() => setInput("Add a testimonials section with 3 reviews")}>
                    💬 Add testimonials
                  </button>
                  <button onClick={() => setInput("Add a pricing section with 3 plans")}>
                    💰 Add pricing
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setInput("A modern coffee shop website with menu and online ordering")}>
                    ☕ Coffee shop
                  </button>
                  <button onClick={() => setInput("A dental clinic website with appointment booking and services")}>
                    🦷 Dental clinic
                  </button>
                  <button onClick={() => setInput("A personal portfolio for a web developer")}>
                    💻 Developer portfolio
                  </button>
                  <button onClick={() => setInput("A yoga studio with class schedule and pricing")}>
                    🧘 Yoga studio
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-sidebar-msg ${msg.role}`}>
            <div className="chat-sidebar-msg-avatar">
              {msg.role === "user" ? "👤" : "🤖"}
            </div>
            <div className="chat-sidebar-msg-bubble">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-progress-indicator">
            <div className="chat-progress-header">
              <div className="chat-progress-avatar">🤖</div>
              <div className="chat-progress-info">
                <span className="chat-progress-title">AI is working</span>
                <span className="chat-progress-status">{progressStatus || "Starting..."}</span>
              </div>
            </div>
            <div className="chat-progress-bar">
              <div className="chat-progress-bar-fill" />
            </div>
          </div>
        )}

        {/* Enhancement suggestions - dynamic based on current website */}
        {hasWebsite && messages.length > 0 && !loading && (() => {
          // Analyze current sections — check both type AND sectionLabel/html for custom sections
          const labels = new Set<string>();
          components.forEach((c) => {
            labels.add(c.type.toLowerCase());
            if (c.props?.sectionLabel) labels.add(c.props.sectionLabel.toLowerCase());
            // Scan HTML content for section keywords
            const html = (c.props?.html || "").toLowerCase();
            if (html.includes("testimonial") || html.includes("review") || html.includes("rating")) labels.add("testimonials");
            if (html.includes("contact") || html.includes("get in touch") || html.includes("form")) labels.add("contact");
            if (html.includes("faq") || html.includes("frequently")) labels.add("faq");
            if (html.includes("pricing") || html.includes("plans") || html.includes("/month")) labels.add("pricing");
            if (html.includes("newsletter") || html.includes("subscribe")) labels.add("newsletter");
            if (html.includes("stats") || html.includes("numbers") || html.includes("metrics")) labels.add("stats");
            if (html.includes("footer")) labels.add("footer");
            if (html.includes("hero") || html.includes("headline")) labels.add("hero");
            if (html.includes("nav")) labels.add("navbar");
            if (html.includes("team") || html.includes("members")) labels.add("team");
            if (html.includes("gallery")) labels.add("gallery");
          });

          const has = (keyword: string) => {
            for (const l of labels) if (l.includes(keyword)) return true;
            return false;
          };

          const suggestions: { icon: string; text: string; prompt: string }[] = [];

          // Always useful
          suggestions.push({ icon: "🎨", text: "Better colors", prompt: "Improve the color scheme with more vibrant, modern colors and better contrast throughout the website" });
          suggestions.push({ icon: "✨", text: "Add animations", prompt: "Add smooth scroll animations and hover effects to make the website feel more interactive" });

          // Suggest missing common sections
          if (!has("testimonial") && !has("review")) {
            suggestions.push({ icon: "⭐", text: "Add reviews", prompt: "Add a customer testimonials section with star ratings and real-looking reviews" });
          }
          if (!has("contact") && !has("form") && !has("touch")) {
            suggestions.push({ icon: "📧", text: "Add contact", prompt: "Add a contact section with a beautiful form, email, and phone number" });
          }
          if (!has("faq") && !has("frequent")) {
            suggestions.push({ icon: "❓", text: "Add FAQ", prompt: "Add a FAQ section with common questions and answers relevant to this website" });
          }
          if (!has("pricing") && !has("plans")) {
            suggestions.push({ icon: "💰", text: "Add pricing", prompt: "Add a pricing section with 3 plans: Starter, Pro, and Enterprise" });
          }
          if (!has("newsletter") && !has("subscribe")) {
            suggestions.push({ icon: "📨", text: "Newsletter", prompt: "Add a newsletter signup section with email input" });
          }
          if (!has("stats") && !has("number") && !has("metric")) {
            suggestions.push({ icon: "📊", text: "Add stats", prompt: "Add a stats/numbers section showing key metrics" });
          }
          if (!has("team") && !has("member")) {
            suggestions.push({ icon: "👥", text: "Add team", prompt: "Add a team section showcasing team members with photos and roles" });
          }
          if (!has("gallery")) {
            suggestions.push({ icon: "🖼️", text: "Add gallery", prompt: "Add an image gallery section showcasing work or portfolio" });
          }

          // Section-specific improvements for existing sections
          if (has("hero")) {
            suggestions.push({ icon: "🏠", text: "Improve hero", prompt: "Make the hero section more impactful with a stronger headline, better CTA, and improved visual hierarchy" });
          }
          if (has("nav")) {
            suggestions.push({ icon: "🧭", text: "Better nav", prompt: "Improve the navigation bar with better styling, hover effects, and a sticky header" });
          }
          if (has("footer")) {
            suggestions.push({ icon: "📋", text: "Rich footer", prompt: "Enhance the footer with more links, social icons, and a polished layout" });
          }

          // General
          suggestions.push({ icon: "📱", text: "Mobile-ready", prompt: "Improve mobile responsiveness with better spacing and readable text on small screens" });
          suggestions.push({ icon: "🔤", text: "Better fonts", prompt: "Use premium typography with better font weights, sizes, and line height" });

          // Pick top 6
          const picked = suggestions.slice(0, 6);

          return (
            <div className="chat-enhance-section">
              <div className="chat-enhance-label">✨ Suggested for your site</div>
              <div className="chat-enhance-grid">
                {picked.map((s, i) => (
                  <button
                    key={i}
                    className="chat-enhance-btn"
                    onClick={() => {
                      setInput(s.prompt);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                  >
                    <span className="chat-enhance-icon">{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-sidebar-input-area">
        <textarea
          ref={inputRef}
          className="chat-sidebar-input"
          placeholder={
            selectedMicroElement
              ? `Edit ${selectedMicroElement.tag}...`
              : selectedComponents.length > 0
                ? `Edit ${selectedComponents.length} section${selectedComponents.length > 1 ? "s" : ""}...`
                : hasWebsite
                  ? "Tell me what to change..."
                  : "Describe your website..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          disabled={loading}
        />
        <button
          className="chat-sidebar-send"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
