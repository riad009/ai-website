"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import type { ComponentData } from "@/types/editor";
import { useEditorStore } from "@/lib/editor-store";

// ── Floating Format Toolbar ─────────────────────────
function FormatToolbar({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const reposition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !targetRef.current?.contains(sel.anchorNode)) {
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const parentRect = targetRef.current.closest(".editor-canvas-wrapper")?.getBoundingClientRect();
    if (parentRect) {
      setPos({
        top: rect.top - parentRect.top - 48,
        left: rect.left - parentRect.left + rect.width / 2,
      });
    } else {
      setPos({ top: rect.top - 48, left: rect.left + rect.width / 2 });
    }
  }, [targetRef]);

  useEffect(() => {
    document.addEventListener("selectionchange", reposition);
    return () => document.removeEventListener("selectionchange", reposition);
  }, [reposition]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    targetRef.current?.focus();
  };

  const handleColor = () => {
    const color = prompt("Enter a color (e.g. #ff0000, red):", "#6366f1");
    if (color) exec("foreColor", color);
  };

  const handleBgColor = () => {
    const color = prompt("Enter highlight color (e.g. #ffff00, yellow):", "#fef08a");
    if (color) exec("hiliteColor", color);
  };

  const handleFontSize = (size: string) => {
    exec("fontSize", size);
  };

  const sel = typeof window !== "undefined" ? window.getSelection() : null;
  const hasSelection = sel && !sel.isCollapsed && targetRef.current?.contains(sel.anchorNode ?? null);

  if (!pos || !hasSelection) return null;

  return (
    <div
      className="format-toolbar"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button onClick={() => exec("bold")} title="Bold (Ctrl+B)" className="fmt-btn">
        <strong>B</strong>
      </button>
      <button onClick={() => exec("italic")} title="Italic (Ctrl+I)" className="fmt-btn">
        <em>I</em>
      </button>
      <button onClick={() => exec("underline")} title="Underline (Ctrl+U)" className="fmt-btn">
        <u>U</u>
      </button>
      <button onClick={() => exec("strikeThrough")} title="Strikethrough" className="fmt-btn">
        <s>S</s>
      </button>
      <span className="fmt-divider" />
      <button onClick={handleColor} title="Text Color" className="fmt-btn">
        🎨
      </button>
      <button onClick={handleBgColor} title="Highlight" className="fmt-btn">
        🖍️
      </button>
      <span className="fmt-divider" />
      <select
        className="fmt-select"
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) handleFontSize(e.target.value);
          e.target.value = "";
        }}
        title="Font Size"
      >
        <option value="" disabled>Size</option>
        <option value="1">Small</option>
        <option value="3">Normal</option>
        <option value="5">Large</option>
        <option value="7">Huge</option>
      </select>
      <span className="fmt-divider" />
      <button onClick={() => exec("justifyLeft")} title="Align Left" className="fmt-btn">⫷</button>
      <button onClick={() => exec("justifyCenter")} title="Center" className="fmt-btn">☰</button>
      <button onClick={() => exec("justifyRight")} title="Align Right" className="fmt-btn">⫸</button>
      <span className="fmt-divider" />
      <button onClick={() => exec("removeFormat")} title="Clear Formatting" className="fmt-btn">✕</button>
    </div>
  );
}

// ── Inline Editable (Rich Text) ─────────────────────
function InlineEditable({
  value,
  onChange,
  tag: Tag = "span",
  className,
  style,
  richText = false,
}: {
  value: string;
  onChange: (v: string) => void;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  richText?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (richText) {
      if (!editing && ref.current.innerHTML !== value) {
        ref.current.innerHTML = value;
      }
    } else {
      if (ref.current.textContent !== value) {
        ref.current.textContent = value;
      }
    }
  }, [value, richText, editing]);

  const TagComponent = Tag as any;

  return (
    <>
      <TagComponent
        ref={ref}
        contentEditable={editing}
        suppressContentEditableWarning
        className={`${className || ""} ${editing ? "inline-editing" : "inline-editable"}`}
        style={{ ...style, cursor: editing ? "text" : "pointer", outline: "none", minWidth: 20, display: "inline-block" }}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          if (!editing) {
            setEditing(true);
            setTimeout(() => ref.current?.focus(), 0);
          }
        }}
        onBlur={(e: React.FocusEvent) => {
          // Don't blur if clicking the format toolbar
          const related = e.relatedTarget as HTMLElement;
          if (related?.closest(".format-toolbar")) return;
          setEditing(false);
          if (ref.current) {
            onChange(richText ? ref.current.innerHTML : (ref.current.textContent || ""));
          }
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Escape") {
            (e.target as HTMLElement).blur();
          }
          // Allow Enter for multiline in rich text, but plain text still uses single-line
          if (!richText && e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            (e.target as HTMLElement).blur();
          }
          e.stopPropagation();
        }}
      />
      {editing && richText && <FormatToolbar targetRef={ref} />}
    </>
  );
}

// ── Main Render ─────────────────────────────────────
interface RenderComponentProps {
  component: ComponentData;
  isPreview?: boolean;
}

// ── Element Wrapper (makes sub-elements selectable) ──
function ElementWrapper({
  componentId,
  path,
  label,
  children,
  inline,
}: {
  componentId: string;
  path: string;
  label?: string;
  children: React.ReactNode;
  inline?: boolean;
}) {
  const { selectedComponentId, selectedElementPath, selectElement, viewMode } = useEditorStore();
  if (viewMode === "preview") return <>{children}</>;
  const isSelected = selectedComponentId === componentId && selectedElementPath === path;
  return (
    <div
      className={`el-wrap${isSelected ? " el-selected" : ""}${inline ? " el-inline" : ""}`}
      onClick={(e) => { e.stopPropagation(); selectElement(componentId, path); }}
      data-el-label={label || path}
    >
      {children}
    </div>
  );
}

export default function RenderComponent({ component, isPreview }: RenderComponentProps) {
  const { updateComponentProps, viewMode } = useEditorStore();
  const editable = viewMode !== "preview" && !isPreview;

  const update = (key: string, val: any) => {
    updateComponentProps(component.id, { [key]: val });
  };

  const p = component.props;

  // Build inline styles from component.styles
  const s = component.styles;
  const sectionStyle: React.CSSProperties = {};
  if (s) {
    if (s.backgroundColor) sectionStyle.backgroundColor = s.backgroundColor;
    if (s.textColor) sectionStyle.color = s.textColor;
    if (s.padding) sectionStyle.padding = `${s.padding}px`;
    if (s.fontSize) sectionStyle.fontSize = `${s.fontSize}px`;
    if (s.borderRadius) sectionStyle.borderRadius = `${s.borderRadius}px`;
    if (s.borderWidth) {
      sectionStyle.border = `${s.borderWidth}px solid ${s.borderColor || "#e2e8f0"}`;
    }
    if (s.maxWidth) { sectionStyle.maxWidth = s.maxWidth; sectionStyle.marginLeft = "auto"; sectionStyle.marginRight = "auto"; }
    if (s.textAlign) sectionStyle.textAlign = s.textAlign;
  }

  const hasSectionStyles = Object.keys(sectionStyle).length > 0;

  const rendered = renderInner();
  if (!hasSectionStyles) return rendered;

  return <div className="edc-section-styles" style={sectionStyle}>{rendered}</div>;

  function renderInner() {

    switch (component.type) {
      // ── NAVBAR ──
      case "navbar":
        return (
          <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
            <ElementWrapper componentId={component.id} path="logo" label="Logo" inline>
              <div style={{ fontWeight: 700, fontSize: 20 }}>
                {editable ? (
                  <InlineEditable value={p.logo} onChange={(v) => update("logo", v)} tag="span" />
                ) : (
                  p.logo
                )}
              </div>
            </ElementWrapper>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {(p.links || []).map((l: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`links.${i}`} label={`Link ${i + 1}`} inline>
                  <span style={{ cursor: "pointer", color: "#64748b" }}>
                    {l.label}
                  </span>
                </ElementWrapper>
              ))}
              <ElementWrapper componentId={component.id} path="ctaText" label="CTA Button" inline>
                <button style={{ padding: "8px 20px", borderRadius: 8, background: "var(--site-primary, #6366f1)", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                  {editable ? (
                    <InlineEditable value={p.ctaText || "Get Started"} onChange={(v) => update("ctaText", v)} tag="span" />
                  ) : (
                    p.ctaText || "Get Started"
                  )}
                </button>
              </ElementWrapper>
            </div>
          </nav>
        );

      // ── HERO ──
      case "hero":
        return (
          <section style={{ position: "relative", padding: "100px 32px", textAlign: "center", background: p.backgroundImage ? `url(${p.backgroundImage}) center/cover` : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", color: "#fff", overflow: "hidden" }}>
            <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
              <ElementWrapper componentId={component.id} path="headline" label="Headline">
                {editable ? (
                  <InlineEditable value={p.headline} onChange={(v) => update("headline", v)} tag="h1" style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }} richText />
                ) : (
                  <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }} dangerouslySetInnerHTML={{ __html: p.headline }} />
                )}
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subheadline" label="Subheadline">
                {editable ? (
                  <InlineEditable value={p.subheadline} onChange={(v) => update("subheadline", v)} tag="p" style={{ fontSize: 20, opacity: 0.9, marginBottom: 32 }} richText />
                ) : (
                  <p style={{ fontSize: 20, opacity: 0.9, marginBottom: 32 }} dangerouslySetInnerHTML={{ __html: p.subheadline }} />
                )}
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="ctaText" label="CTA Button" inline>
                <button style={{ padding: "14px 36px", borderRadius: 12, fontSize: 18, fontWeight: 700, border: "none", background: "#fff", color: "#6366f1", cursor: "pointer" }}>
                  {p.ctaText || "Get Started"}
                </button>
              </ElementWrapper>
            </div>
          </section>
        );

      // ── FEATURES ──
      case "features":
        return (
          <section style={{ padding: "80px 32px", background: "#f8fafc" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                {editable ? (
                  <InlineEditable value={p.title} onChange={(v) => update("title", v)} tag="h2" style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }} richText />
                ) : (
                  <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: p.title }} />
                )}
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                <p style={{ color: "#64748b", fontSize: 18 }}>{p.subtitle}</p>
              </ElementWrapper>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32, maxWidth: 1000, margin: "0 auto" }}>
              {(p.items || []).map((item: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`items.${i}`} label={item.title || `Card ${i + 1}`}>
                  <div style={{ background: "#fff", padding: 32, borderRadius: 16, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                    <p style={{ color: "#64748b" }}>{item.description}</p>
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── ABOUT ──
      case "about":
        return (
          <section style={{ padding: "80px 32px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                {editable ? (
                  <InlineEditable value={p.title} onChange={(v) => update("title", v)} tag="h2" style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }} richText />
                ) : (
                  <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: p.title }} />
                )}
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="description" label="Description">
                {editable ? (
                  <InlineEditable value={p.description} onChange={(v) => update("description", v)} tag="p" style={{ fontSize: 18, color: "#64748b", marginBottom: 40, lineHeight: 1.7 }} richText />
                ) : (
                  <p style={{ fontSize: 18, color: "#64748b", marginBottom: 40, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: p.description }} />
                )}
              </ElementWrapper>
              {p.stats?.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 48 }}>
                  {p.stats.map((s: any, i: number) => (
                    <ElementWrapper key={i} componentId={component.id} path={`stats.${i}`} label={s.label || `Stat ${i + 1}`} inline>
                      <div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: "#6366f1" }}>{s.value}</div>
                        <div style={{ color: "#64748b" }}>{s.label}</div>
                      </div>
                    </ElementWrapper>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      // ── SERVICES ──
      case "services":
        return (
          <section style={{ padding: "80px 32px", background: "#f8fafc" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{p.title}</h2>
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                <p style={{ color: "#64748b", fontSize: 18 }}>{p.subtitle}</p>
              </ElementWrapper>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, maxWidth: 1000, margin: "0 auto" }}>
              {(p.items || []).map((item: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`items.${i}`} label={item.title || `Service ${i + 1}`}>
                  <div style={{ background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                    <p style={{ color: "#64748b", marginBottom: 12 }}>{item.description}</p>
                    {item.price && <div style={{ fontWeight: 700, color: "#6366f1" }}>{item.price}</div>}
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── PRICING ──
      case "pricing":
        return (
          <section style={{ padding: "80px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{p.title}</h2>
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                <p style={{ color: "#64748b", fontSize: 18 }}>{p.subtitle}</p>
              </ElementWrapper>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32, maxWidth: 1000, margin: "0 auto" }}>
              {(p.plans || []).map((plan: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`plans.${i}`} label={plan.name || `Plan ${i + 1}`}>
                  <div style={{ background: plan.highlighted ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#fff", color: plan.highlighted ? "#fff" : "inherit", padding: 32, borderRadius: 16, textAlign: "center", border: plan.highlighted ? "none" : "1px solid #e2e8f0", transform: plan.highlighted ? "scale(1.05)" : "none" }}>
                    <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{plan.name}</h3>
                    <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>{plan.price}<small style={{ fontSize: 16, opacity: 0.7 }}>{plan.period}</small></div>
                    <ul style={{ listStyle: "none", padding: 0, marginBottom: 24 }}>
                      {(plan.features || []).map((f: string, fi: number) => (
                        <li key={fi} style={{ padding: "6px 0", opacity: 0.85 }}>✓ {f}</li>
                      ))}
                    </ul>
                    <button style={{ padding: "12px 28px", borderRadius: 10, border: plan.highlighted ? "2px solid #fff" : "2px solid #6366f1", background: plan.highlighted ? "#fff" : "#6366f1", color: plan.highlighted ? "#6366f1" : "#fff", fontWeight: 700, cursor: "pointer" }}>
                      {plan.ctaText}
                    </button>
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── CONTACT ──
      case "contact":
        return (
          <section style={{ padding: "80px 32px", background: "#f8fafc" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{p.title}</h2>
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                <p style={{ color: "#64748b", fontSize: 18, marginBottom: 32 }}>{p.subtitle}</p>
              </ElementWrapper>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(p.formFields || []).map((field: any, i: number) => (
                  <ElementWrapper key={i} componentId={component.id} path={`formFields.${i}`} label={field.label || `Field ${i + 1}`}>
                    <div>
                      {field.type === "textarea" ? (
                        <textarea placeholder={field.placeholder} rows={4} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16 }} readOnly />
                      ) : (
                        <input type={field.type} placeholder={field.placeholder} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16 }} readOnly />
                      )}
                    </div>
                  </ElementWrapper>
                ))}
                <button style={{ padding: "14px", borderRadius: 10, background: "#6366f1", color: "#fff", border: "none", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
                  Send Message
                </button>
              </div>
              <div style={{ marginTop: 32, color: "#64748b", fontSize: 14 }}>
                {p.email && <div>📧 {p.email}</div>}
                {p.phone && <div>📞 {p.phone}</div>}
                {p.address && <div>📍 {p.address}</div>}
              </div>
            </div>
          </section>
        );

      // ── PRODUCT GRID ──
      case "product-grid":
        return (
          <section style={{ padding: "80px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{p.title}</h2>
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                <p style={{ color: "#64748b", fontSize: 18 }}>{p.subtitle}</p>
              </ElementWrapper>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
              {(p.products || []).map((prod: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`products.${i}`} label={prod.name || `Product ${i + 1}`}>
                  <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
                    <div style={{ height: 180, background: prod.image ? `url(${prod.image}) center/cover` : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#94a3b8" }}>
                      {!prod.image && "🖼️"}
                    </div>
                    <div style={{ padding: 20 }}>
                      {prod.badge && <span style={{ background: "#6366f1", color: "#fff", padding: "2px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{prod.badge}</span>}
                      <h3 style={{ fontSize: 18, fontWeight: 600, margin: "8px 0 4px" }}>{prod.name}</h3>
                      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>{prod.description}</p>
                      <div style={{ fontWeight: 700, fontSize: 20, color: "#6366f1" }}>{prod.price}</div>
                    </div>
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── MENU CARD ──
      case "menu-card":
        return (
          <section style={{ padding: "80px 32px", background: "#fffbf0" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{p.title}</h2>
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                <p style={{ color: "#64748b", fontSize: 18 }}>{p.subtitle}</p>
              </ElementWrapper>
            </div>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              {(p.categories || []).map((cat: any, ci: number) => (
                <ElementWrapper key={ci} componentId={component.id} path={`categories.${ci}`} label={cat.name || `Category ${ci + 1}`}>
                  <div style={{ marginBottom: 40 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>{cat.name}</h3>
                    {(cat.items || []).map((item: any, ii: number) => (
                      <ElementWrapper key={ii} componentId={component.id} path={`categories.${ci}.items.${ii}`} label={item.name || `Item ${ii + 1}`}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px dotted #e2e8f0" }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            <div style={{ color: "#64748b", fontSize: 14 }}>{item.description}</div>
                          </div>
                          <div style={{ fontWeight: 700, color: "#6366f1", whiteSpace: "nowrap" }}>{item.price}</div>
                        </div>
                      </ElementWrapper>
                    ))}
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── FOOTER ──
      case "footer":
        return (
          <footer style={{ padding: "60px 32px 32px", background: "#1a1a2e", color: "#a0aec0" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40 }}>
              <div>
                <ElementWrapper componentId={component.id} path="logo" label="Logo">
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{p.logo}</div>
                </ElementWrapper>
                <ElementWrapper componentId={component.id} path="description" label="Description">
                  <p style={{ lineHeight: 1.7 }}>{p.description}</p>
                </ElementWrapper>
              </div>
              {(p.links || []).map((group: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`links.${i}`} label={group.title || `Links ${i + 1}`}>
                  <div>
                    <h4 style={{ color: "#fff", marginBottom: 16, fontWeight: 600 }}>{group.title}</h4>
                    {(group.items || []).map((link: any, li: number) => (
                      <div key={li} style={{ marginBottom: 8, cursor: "pointer" }}>{link.label}</div>
                    ))}
                  </div>
                </ElementWrapper>
              ))}
            </div>
            <ElementWrapper componentId={component.id} path="copyright" label="Copyright">
              <div style={{ borderTop: "1px solid #2d3748", marginTop: 40, paddingTop: 24, textAlign: "center", fontSize: 14 }}>
                {p.copyright}
              </div>
            </ElementWrapper>
          </footer>
        );

      // ── TESTIMONIALS ──
      case "testimonials":
        return (
          <section style={{ padding: "80px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{p.title}</h2>
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                <p style={{ color: "#64748b", fontSize: 18 }}>{p.subtitle}</p>
              </ElementWrapper>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, maxWidth: 1000, margin: "0 auto" }}>
              {(p.items || []).map((t: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`items.${i}`} label={t.name || `Testimonial ${i + 1}`}>
                  <div style={{ background: "#f8fafc", padding: 32, borderRadius: 16, position: "relative" }}>
                    <div style={{ fontSize: 40, lineHeight: 1, color: "#6366f1", marginBottom: 16 }}>"</div>
                    <p style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>{t.text || t.quote}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                        {t.name?.[0] || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: 14, color: "#64748b" }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── CTA BANNER ──
      case "cta-banner":
        return (
          <section style={{ padding: "80px 32px", background: p.backgroundColor || "#6366f1", color: p.textColor || "#fff", textAlign: "center" }}>
            <ElementWrapper componentId={component.id} path="headline" label="Headline">
              {editable ? (
                <InlineEditable value={p.headline} onChange={(v) => update("headline", v)} tag="h2" style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }} richText />
              ) : (
                <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: p.headline }} />
              )}
            </ElementWrapper>
            <ElementWrapper componentId={component.id} path="subheadline" label="Subheadline">
              {editable ? (
                <InlineEditable value={p.subheadline} onChange={(v) => update("subheadline", v)} tag="p" style={{ fontSize: 20, opacity: 0.9, marginBottom: 32 }} richText />
              ) : (
                <p style={{ fontSize: 20, opacity: 0.9, marginBottom: 32 }} dangerouslySetInnerHTML={{ __html: p.subheadline }} />
              )}
            </ElementWrapper>
            <ElementWrapper componentId={component.id} path="ctaText" label="CTA Button" inline>
              <button style={{ padding: "16px 40px", borderRadius: 12, fontSize: 18, fontWeight: 700, border: "2px solid currentColor", background: "transparent", color: "inherit", cursor: "pointer" }}>
                {p.ctaText}
              </button>
            </ElementWrapper>
          </section>
        );

      // ── FAQ ──
      case "faq":
        return (
          <section style={{ padding: "80px 32px" }}>
            <ElementWrapper componentId={component.id} path="title" label="Title">
              <h2 style={{ fontSize: 36, fontWeight: 700, textAlign: "center", marginBottom: 48 }}>{p.title}</h2>
            </ElementWrapper>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              {(p.items || []).map((item: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`items.${i}`} label={`FAQ ${i + 1}`}>
                  <details style={{ marginBottom: 16, background: "#f8fafc", borderRadius: 12, overflow: "hidden" }}>
                    <summary style={{ padding: "20px 24px", fontWeight: 600, cursor: "pointer", fontSize: 16 }}>{item.question}</summary>
                    <div style={{ padding: "0 24px 20px", color: "#64748b", lineHeight: 1.7 }}>{item.answer}</div>
                  </details>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── STATS ──
      case "stats":
        return (
          <section style={{ padding: "80px 32px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", textAlign: "center" }}>
            {p.title && (
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 48 }}>{p.title}</h2>
              </ElementWrapper>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: 64, flexWrap: "wrap" }}>
              {(p.items || []).map((s: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`items.${i}`} label={s.label || `Stat ${i + 1}`} inline>
                  <div>
                    <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ opacity: 0.8, marginTop: 8 }}>{s.label}</div>
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── IMAGE GALLERY ──
      case "image-gallery":
        return (
          <section style={{ padding: "80px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{p.title}</h2>
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                <p style={{ color: "#64748b", fontSize: 18 }}>{p.subtitle}</p>
              </ElementWrapper>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${p.columns || 3}, 1fr)`, gap: 16, maxWidth: 1000, margin: "0 auto" }}>
              {(p.images || []).map((img: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`images.${i}`} label={img.caption || `Image ${i + 1}`}>
                  <div style={{ borderRadius: 12, overflow: "hidden", background: "#e2e8f0", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {img.src ? (
                      <img src={img.src} alt={img.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ color: "#94a3b8", textAlign: "center" }}>
                        <div style={{ fontSize: 40 }}>🖼️</div>
                        <div style={{ fontSize: 14, marginTop: 8 }}>{img.caption || "No image"}</div>
                      </div>
                    )}
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── TEAM ──
      case "team":
        return (
          <section style={{ padding: "80px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{p.title}</h2>
              </ElementWrapper>
              {p.subtitle && (
                <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                  <p style={{ color: "#64748b", fontSize: 18 }}>{p.subtitle}</p>
                </ElementWrapper>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32, maxWidth: 1000, margin: "0 auto" }}>
              {(p.members || []).map((m: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`members.${i}`} label={m.name || `Member ${i + 1}`}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#6366f1", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 36, fontWeight: 700 }}>
                      {m.avatar ? <img src={m.avatar} alt={m.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : m.name?.[0] || "?"}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{m.name}</h3>
                    <div style={{ color: "#6366f1", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{m.role}</div>
                    <p style={{ color: "#64748b", fontSize: 14 }}>{m.bio}</p>
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── SPACER ──
      case "spacer":
        return <div style={{ height: p.height || 60, background: editable ? "repeating-linear-gradient(45deg, transparent, transparent 10px, #f1f5f9 10px, #f1f5f9 20px)" : "transparent" }} />;

      // ── DIVIDER ──
      case "divider":
        return (
          <div style={{ padding: "8px 32px" }}>
            <hr style={{ border: "none", borderTop: `${p.thickness || 1}px ${p.style || "solid"} ${p.color || "#e2e8f0"}` }} />
          </div>
        );

      // ── TRUST BADGES ──
      case "trust-badges":
        return (
          <section style={{ padding: "24px 32px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", maxWidth: 1000, margin: "0 auto" }}>
              {(p.badges || []).map((badge: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`badges.${i}`} label={badge.title || `Badge ${i + 1}`} inline>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                    <div style={{ fontSize: 28, lineHeight: 1 }}>{badge.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{badge.title}</div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>{badge.description}</div>
                    </div>
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── PROMO BANNER ──
      case "promo-banner":
        return (
          <section style={{ padding: "16px 32px", background: p.backgroundColor || "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
              <ElementWrapper componentId={component.id} path="text" label="Promo Text" inline>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{p.text}</span>
              </ElementWrapper>
              {p.ctaText && (
                <ElementWrapper componentId={component.id} path="ctaText" label="CTA Button" inline>
                  <button style={{ padding: "8px 20px", borderRadius: 8, border: "2px solid #fff", background: "transparent", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                    {p.ctaText}
                  </button>
                </ElementWrapper>
              )}
            </div>
          </section>
        );

      // ── COLLECTION GRID ──
      case "collection-grid":
        return (
          <section style={{ padding: "80px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{p.title}</h2>
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                <p style={{ color: "#64748b", fontSize: 18 }}>{p.subtitle}</p>
              </ElementWrapper>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
              {(p.collections || []).map((col: any, i: number) => (
                <ElementWrapper key={i} componentId={component.id} path={`collections.${i}`} label={col.name || `Collection ${i + 1}`}>
                  <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.2s" }}>
                    <div style={{ height: 180, background: col.image ? `url(${col.image}) center/cover` : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#fff" }}>
                      {!col.image && "📂"}
                    </div>
                    <div style={{ padding: 20, background: "#fff" }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{col.name}</h3>
                      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>{col.description}</p>
                      {col.itemCount && <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 600 }}>{col.itemCount} items</span>}
                    </div>
                  </div>
                </ElementWrapper>
              ))}
            </div>
          </section>
        );

      // ── NEWSLETTER ──
      case "newsletter":
        return (
          <section style={{ padding: "80px 32px", background: "linear-gradient(135deg, #f0f4ff, #e8ecff)", textAlign: "center" }}>
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
              <ElementWrapper componentId={component.id} path="title" label="Title">
                <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{p.title}</h2>
              </ElementWrapper>
              <ElementWrapper componentId={component.id} path="subtitle" label="Subtitle">
                <p style={{ color: "#64748b", fontSize: 16, marginBottom: 32 }}>{p.subtitle}</p>
              </ElementWrapper>
              <div style={{ display: "flex", gap: 12, maxWidth: 440, margin: "0 auto" }}>
                <input
                  type="email"
                  placeholder={p.placeholder || "Enter your email"}
                  style={{ flex: 1, padding: "14px 18px", borderRadius: 12, border: "1px solid #d1d5db", fontSize: 15, outline: "none" }}
                  readOnly
                />
                <ElementWrapper componentId={component.id} path="ctaText" label="CTA Button" inline>
                  <button style={{ padding: "14px 28px", borderRadius: 12, background: "#6366f1", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {p.ctaText || "Subscribe"}
                  </button>
                </ElementWrapper>
              </div>
            </div>
          </section>
        );

      // ── CUSTOM (AI-generated HTML) ──
      case "custom":
        return (
          <section
            style={{
              '--primary': 'var(--site-primary, #6366f1)',
              '--secondary': 'var(--site-secondary, #0ea5e9)',
              '--accent': 'var(--site-accent, #f43f5e)',
              '--bg': 'var(--site-bg, #ffffff)',
              '--text': 'var(--site-text, #1a1a2e)',
            } as React.CSSProperties}
          >
            {p.sectionLabel && editable && (
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#94a3b8',
                padding: '4px 16px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
              }}>
                {p.sectionLabel}
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: p.html || '' }} />
          </section>
        );

      // ── UNKNOWN ──
      default:
        return (
          <div style={{ padding: 32, textAlign: "center", background: "#fef2f2", color: "#ef4444", borderRadius: 12 }}>
            Unknown component: <strong>{component.type}</strong>
          </div>
        );
    }
  } // end renderInner
}
