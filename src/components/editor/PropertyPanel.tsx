"use client";

import React, { useState, useMemo } from "react";
import { useEditorStore, COMPONENT_REGISTRY } from "@/lib/editor-store";
import SectionStylePanel from "./SectionStylePanel";
import ElementStylePanel from "./ElementStylePanel";

// ── Extract visual elements from HTML ──
interface VisualElement {
  tag: string;
  text: string;
  index: number; // occurrence index in the HTML
  label: string;
  icon: string;
}

function extractVisualElements(html: string): VisualElement[] {
  if (!html) return [];
  const elements: VisualElement[] = [];
  const patterns: { tag: string; regex: RegExp; label: string; icon: string }[] = [
    { tag: "h1", regex: /<h1[^>]*>([\s\S]*?)<\/h1>/gi, label: "Main Heading", icon: "🔤" },
    { tag: "h2", regex: /<h2[^>]*>([\s\S]*?)<\/h2>/gi, label: "Heading", icon: "🔤" },
    { tag: "h3", regex: /<h3[^>]*>([\s\S]*?)<\/h3>/gi, label: "Sub-heading", icon: "🔤" },
    { tag: "h4", regex: /<h4[^>]*>([\s\S]*?)<\/h4>/gi, label: "Small Heading", icon: "🔤" },
    { tag: "button", regex: /<button[^>]*>([\s\S]*?)<\/button>/gi, label: "Button", icon: "🔘" },
    { tag: "a", regex: /<a[^>]*>([\s\S]*?)<\/a>/gi, label: "Link", icon: "🔗" },
    { tag: "p", regex: /<p[^>]*>([\s\S]*?)<\/p>/gi, label: "Paragraph", icon: "📝" },
    { tag: "span", regex: /<span[^>]*>([\s\S]*?)<\/span>/gi, label: "Text", icon: "✏️" },
    { tag: "li", regex: /<li[^>]*>([\s\S]*?)<\/li>/gi, label: "List Item", icon: "•" },
    { tag: "img", regex: /<img[^>]*alt="([^"]*)"[^>]*>/gi, label: "Image Alt", icon: "🖼️" },
  ];

  patterns.forEach(({ tag, regex, label, icon }) => {
    let match;
    let idx = 0;
    while ((match = regex.exec(html)) !== null) {
      // Strip inner HTML tags to get just text
      const text = match[1]?.replace(/<[^>]*>/g, "").trim();
      if (text && text.length > 0 && text.length < 500) {
        elements.push({ tag, text, index: idx, label: `${label}`, icon });
      }
      idx++;
    }
  });

  return elements;
}

function replaceNthOccurrence(html: string, tag: string, index: number, newText: string): string {
  // For img tags with alt text
  if (tag === "img") {
    let count = 0;
    return html.replace(/<img([^>]*)alt="([^"]*)"([^>]*)>/gi, (match, before, _alt, after) => {
      if (count++ === index) return `<img${before}alt="${newText}"${after}>`;
      return match;
    });
  }

  // For regular tags
  const tagRegex = new RegExp(`(<${tag}[^>]*>)([\\s\\S]*?)(<\\/${tag}>)`, "gi");

  let count = 0;
  return html.replace(tagRegex, (match, open, content, close) => {
    const text = content.replace(/<[^>]*>/g, "").trim();
    if (text && text.length > 0 && text.length < 500) {
      if (count++ === index) {
        // Check if content has inner HTML (e.g., <span> inside <button>)
        const innerTags = content.match(/<[^>]*>/g);
        if (innerTags && innerTags.length > 0) {
          // Replace just the text portions, preserve inner markup
          return `${open}${newText}${close}`;
        }
        return `${open}${newText}${close}`;
      }
    }
    return match;
  });
}

// ── Custom Section Visual Editor ──
function CustomSectionEditor({ component, update }: { component: any; update: (key: string, value: any) => void }) {
  const html = component.props?.html || "";
  const elements = useMemo(() => extractVisualElements(html), [html]);
  const sectionLabel = component.props?.sectionLabel || "";
  const { selectedMicroElement, setMicroElement } = useEditorStore();

  // Check if we have a focused micro-element
  const hasFocus = selectedMicroElement && selectedMicroElement.sectionId === component.id;

  // Filter elements based on micro-element selection
  const getFilteredElements = () => {
    if (!hasFocus || !selectedMicroElement) return null;

    const focusText = selectedMicroElement.text.toLowerCase();
    const focusTag = selectedMicroElement.tag.toLowerCase();

    // Try to find elements that match the clicked element's text
    const matched = elements.filter((el) => {
      const elText = el.text.toLowerCase();
      // Match by text content
      if (elText === focusText) return true;
      if (focusText.length > 3 && elText.includes(focusText)) return true;
      if (elText.length > 3 && focusText.includes(elText)) return true;
      return false;
    });

    // If we found specific matches, also include nearby elements (same "card" / parent context)
    if (matched.length > 0) {
      // Find elements within a ±3 index range of any matched element to get the surrounding context
      const matchedIndices = new Set<number>();
      matched.forEach((m) => {
        const idx = elements.indexOf(m);
        for (let i = Math.max(0, idx - 3); i <= Math.min(elements.length - 1, idx + 3); i++) {
          matchedIndices.add(i);
        }
      });
      return elements.filter((_, i) => matchedIndices.has(i));
    }

    // Fallback: filter by tag type
    const tagMap: Record<string, string[]> = {
      "button": ["button", "a"],
      "a": ["button", "a"],
      "link": ["button", "a"],
      "heading": ["h1", "h2", "h3", "h4"],
      "h1": ["h1", "h2", "h3", "h4"],
      "h2": ["h1", "h2", "h3", "h4"],
      "h3": ["h1", "h2", "h3", "h4"],
      "h4": ["h1", "h2", "h3", "h4"],
      "paragraph": ["p"],
      "p": ["p"],
      "text": ["span", "p"],
      "span": ["span"],
      "image": ["img"],
      "img": ["img"],
      "list item": ["li"],
      "li": ["li"],
    };
    const tags = tagMap[focusTag.toLowerCase()] || [focusTag.toLowerCase()];
    return elements.filter((el) => tags.includes(el.tag));
  };

  const filtered = hasFocus ? getFilteredElements() : null;
  const displayElements = filtered || elements;

  // Group elements by type
  const headings = displayElements.filter((e) => e.tag.startsWith("h"));
  const buttons = displayElements.filter((e) => e.tag === "button" || e.tag === "a");
  const paragraphs = displayElements.filter((e) => e.tag === "p");
  const listItems = displayElements.filter((e) => e.tag === "li");
  const otherTexts = displayElements.filter((e) => e.tag === "span");

  const handleTextChange = (el: VisualElement, newText: string) => {
    const newHtml = replaceNthOccurrence(html, el.tag, el.index, newText);
    update("html", newHtml);
  };

  return (
    <div className="visual-editor">
      {/* Focused element header */}
      {hasFocus && selectedMicroElement && (
        <div className="ve-focus-bar">
          <div className="ve-focus-info">
            <span className="ve-focus-badge">🎯 {selectedMicroElement.tag}</span>
            <span className="ve-focus-text">"{selectedMicroElement.text}"</span>
          </div>
          <button className="ve-focus-clear" onClick={() => setMicroElement(null)}>
            Show all
          </button>
        </div>
      )}

      {/* Section Label — always shown */}
      {!hasFocus && (
        <div className="ve-group">
          <div className="ve-group-title">📌 Section Label</div>
          <input
            type="text"
            className="ve-input"
            value={sectionLabel}
            onChange={(e) => update("sectionLabel", e.target.value)}
            placeholder="Section name..."
          />
        </div>
      )}

      {/* Headings */}
      {headings.length > 0 && (
        <div className="ve-group">
          <div className="ve-group-title">🔤 Headings</div>
          {headings.map((el, i) => (
            <div key={`h-${i}`} className="ve-field">
              <label className="ve-label">{el.label}</label>
              <input
                type="text"
                className="ve-input"
                value={el.text}
                onChange={(e) => handleTextChange(el, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Paragraphs */}
      {paragraphs.length > 0 && (
        <div className="ve-group">
          <div className="ve-group-title">📝 Text Content</div>
          {paragraphs.map((el, i) => (
            <div key={`p-${i}`} className="ve-field">
              <label className="ve-label">{el.label} {i + 1}</label>
              <textarea
                className="ve-textarea"
                value={el.text}
                onChange={(e) => handleTextChange(el, e.target.value)}
                rows={2}
              />
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      {buttons.length > 0 && (
        <div className="ve-group">
          <div className="ve-group-title">🔘 Buttons</div>
          {buttons.map((el, i) => (
            <div key={`btn-${i}`} className="ve-field">
              <label className="ve-label">{el.label}</label>
              <input
                type="text"
                className="ve-input"
                value={el.text}
                onChange={(e) => handleTextChange(el, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* List items */}
      {listItems.length > 0 && (
        <div className="ve-group">
          <div className="ve-group-title">• List Items</div>
          {listItems.map((el, i) => (
            <div key={`li-${i}`} className="ve-field">
              <input
                type="text"
                className="ve-input"
                value={el.text}
                onChange={(e) => handleTextChange(el, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Other text */}
      {otherTexts.length > 0 && otherTexts.length <= 20 && (
        <div className="ve-group">
          <div className="ve-group-title">✏️ Other Text</div>
          {otherTexts.slice(0, 10).map((el, i) => (
            <div key={`span-${i}`} className="ve-field">
              <input
                type="text"
                className="ve-input"
                value={el.text}
                onChange={(e) => handleTextChange(el, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      {displayElements.length === 0 && (
        <div className="ve-empty">
          <p>No editable elements found. Use the AI chat to modify this section.</p>
        </div>
      )}
    </div>
  );
}

// ── Main PropertyPanel ──
export default function PropertyPanel() {
  const { selectedComponentId, selectedElementPath, components, updateComponentProps } = useEditorStore();
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");

  const component = components.find((c) => c.id === selectedComponentId);
  if (!component) {
    return (
      <div className="editor-props-panel">
        <div className="editor-props-empty">
          <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
          <h4>No component selected</h4>
          <p>Click on a component in the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }

  // If an element within a section is selected, show element panel
  if (selectedElementPath) {
    return (
      <div className="editor-props-panel">
        <ElementStylePanel />
      </div>
    );
  }

  const def = COMPONENT_REGISTRY.find((c) => c.type === component.type);
  const isCustom = component.type === "custom";

  const update = (key: string, value: any) => {
    updateComponentProps(component.id, { [key]: value });
  };

  return (
    <div className="editor-props-panel">
      <div className="editor-props-header">
        <span className="editor-props-icon">{def?.icon || "📦"}</span>
        <h3>{isCustom ? (component.props?.sectionLabel || "Custom Section") : (def?.label || component.type)}</h3>
      </div>

      {/* Tab Switcher */}
      <div className="pp-tabs">
        <button className={`pp-tab ${activeTab === "content" ? "active" : ""}`} onClick={() => setActiveTab("content")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          Content
        </button>
        <button className={`pp-tab ${activeTab === "style" ? "active" : ""}`} onClick={() => setActiveTab("style")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><line x1="2" y1="12" x2="22" y2="12" /></svg>
          Style
        </button>
      </div>

      {activeTab === "content" ? (
        <div className="editor-props-body">
          {isCustom ? (
            <CustomSectionEditor component={component} update={update} />
          ) : (
            Object.entries(component.props).map(([key, value]) => (
              <PropertyField key={key} label={key} value={value} onChange={(v) => update(key, v)} />
            ))
          )}
        </div>
      ) : (
        <div className="editor-props-body">
          <SectionStylePanel />
        </div>
      )}
    </div>
  );
}

// ── Generic Property Field (for non-custom components) ──
function PropertyField({
  label,
  value,
  onChange,
  depth = 0,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
  depth?: number;
}) {
  if (value === null || value === undefined) return null;

  // Colour
  if (typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value)) {
    return (
      <div className="editor-prop-field">
        <label>{formatLabel(label)}</label>
        <div className="editor-prop-color">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="editor-prop-text" />
        </div>
      </div>
    );
  }

  // Boolean
  if (typeof value === "boolean") {
    return (
      <div className="editor-prop-field">
        <label>{formatLabel(label)}</label>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      </div>
    );
  }

  // Number
  if (typeof value === "number") {
    return (
      <div className="editor-prop-field">
        <label>{formatLabel(label)}</label>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="editor-prop-text" />
      </div>
    );
  }

  // String
  if (typeof value === "string") {
    const isLong = value.length > 80;
    return (
      <div className="editor-prop-field">
        <label>{formatLabel(label)}</label>
        {isLong ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} className="editor-prop-textarea" rows={3} />
        ) : (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="editor-prop-text" />
        )}
      </div>
    );
  }

  // Arrays
  if (Array.isArray(value)) {
    if (depth > 1) {
      return (
        <div className="editor-prop-field">
          <label>{formatLabel(label)} ({value.length} items)</label>
          <span className="editor-prop-note">Nested arrays — edit inline on canvas</span>
        </div>
      );
    }
    return (
      <div className="editor-prop-field">
        <label>{formatLabel(label)} ({value.length})</label>
        <div className="editor-prop-array">
          {value.map((item, i) => (
            <details key={i} className="editor-prop-array-item">
              <summary>
                {typeof item === "object" ? (item.name || item.title || item.label || item.question || `Item ${i + 1}`) : `Item ${i + 1}`}
                <button
                  className="editor-prop-remove"
                  onClick={(e) => {
                    e.preventDefault();
                    const next = [...value];
                    next.splice(i, 1);
                    onChange(next);
                  }}
                >
                  ✕
                </button>
              </summary>
              {typeof item === "object" ? (
                Object.entries(item).map(([k, v]) => (
                  <PropertyField
                    key={k}
                    label={k}
                    value={v}
                    depth={depth + 1}
                    onChange={(newVal) => {
                      const next = [...value];
                      next[i] = { ...next[i], [k]: newVal };
                      onChange(next);
                    }}
                  />
                ))
              ) : (
                <input
                  type="text"
                  value={String(item)}
                  onChange={(e) => {
                    const next = [...value];
                    next[i] = e.target.value;
                    onChange(next);
                  }}
                  className="editor-prop-text"
                />
              )}
            </details>
          ))}
          <button
            className="editor-prop-add"
            onClick={() => {
              if (value.length > 0 && typeof value[0] === "object") {
                const template = JSON.parse(JSON.stringify(value[0]));
                for (const k in template) {
                  if (typeof template[k] === "string") template[k] = "";
                }
                onChange([...value, template]);
              } else {
                onChange([...value, ""]);
              }
            }}
          >
            + Add Item
          </button>
        </div>
      </div>
    );
  }

  // Objects
  if (typeof value === "object") {
    return (
      <details className="editor-prop-object" open={depth === 0}>
        <summary>{formatLabel(label)}</summary>
        {Object.entries(value).map(([k, v]) => (
          <PropertyField
            key={k}
            label={k}
            value={v}
            depth={depth + 1}
            onChange={(newVal) => onChange({ ...value, [k]: newVal })}
          />
        ))}
      </details>
    );
  }

  return null;
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}
