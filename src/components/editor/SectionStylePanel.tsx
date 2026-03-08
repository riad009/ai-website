"use client";

import React from "react";
import type { ComponentStyles } from "@/types/editor";
import { useEditorStore } from "@/lib/editor-store";

export default function SectionStylePanel() {
  const { selectedComponentId, components, updateComponentStyles } = useEditorStore();
  const component = components.find((c) => c.id === selectedComponentId);

  if (!component) return null;

  const styles: ComponentStyles = component.styles || {};

  const set = (key: keyof ComponentStyles, value: any) => {
    updateComponentStyles(component.id, { [key]: value });
  };

  return (
    <div className="style-panel">
      <div className="style-panel-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span>Section Styles</span>
      </div>

      {/* Background Color */}
      <div className="style-row">
        <label>Background</label>
        <div className="style-color-input">
          <input
            type="color"
            value={styles.backgroundColor || "#ffffff"}
            onChange={(e) => set("backgroundColor", e.target.value)}
          />
          <input
            type="text"
            value={styles.backgroundColor || ""}
            onChange={(e) => set("backgroundColor", e.target.value)}
            placeholder="transparent"
            className="style-text-input"
          />
          {styles.backgroundColor && (
            <button className="style-clear-btn" onClick={() => set("backgroundColor", undefined)} title="Reset">✕</button>
          )}
        </div>
      </div>

      {/* Text Color */}
      <div className="style-row">
        <label>Text Color</label>
        <div className="style-color-input">
          <input
            type="color"
            value={styles.textColor || "#000000"}
            onChange={(e) => set("textColor", e.target.value)}
          />
          <input
            type="text"
            value={styles.textColor || ""}
            onChange={(e) => set("textColor", e.target.value)}
            placeholder="inherit"
            className="style-text-input"
          />
          {styles.textColor && (
            <button className="style-clear-btn" onClick={() => set("textColor", undefined)} title="Reset">✕</button>
          )}
        </div>
      </div>

      {/* Font Size */}
      <div className="style-row">
        <label>Font Size</label>
        <div className="style-range-row">
          <input
            type="range"
            min={10}
            max={72}
            step={1}
            value={styles.fontSize || 16}
            onChange={(e) => set("fontSize", Number(e.target.value))}
          />
          <span className="style-range-val">{styles.fontSize || 16}px</span>
          {styles.fontSize && (
            <button className="style-clear-btn" onClick={() => set("fontSize", undefined)} title="Reset">✕</button>
          )}
        </div>
      </div>

      {/* Padding */}
      <div className="style-row">
        <label>Padding</label>
        <div className="style-range-row">
          <input
            type="range"
            min={0}
            max={120}
            step={4}
            value={styles.padding || 0}
            onChange={(e) => set("padding", Number(e.target.value))}
          />
          <span className="style-range-val">{styles.padding || 0}px</span>
          {styles.padding && (
            <button className="style-clear-btn" onClick={() => set("padding", undefined)} title="Reset">✕</button>
          )}
        </div>
      </div>

      {/* Border Radius */}
      <div className="style-row">
        <label>Corners</label>
        <div className="style-range-row">
          <input
            type="range"
            min={0}
            max={48}
            step={2}
            value={styles.borderRadius || 0}
            onChange={(e) => set("borderRadius", Number(e.target.value))}
          />
          <span className="style-range-val">{styles.borderRadius || 0}px</span>
          {styles.borderRadius && (
            <button className="style-clear-btn" onClick={() => set("borderRadius", undefined)} title="Reset">✕</button>
          )}
        </div>
      </div>

      {/* Border */}
      <div className="style-row">
        <label>Border</label>
        <div className="style-border-row">
          <input
            type="number"
            min={0}
            max={10}
            value={styles.borderWidth || 0}
            onChange={(e) => set("borderWidth", Number(e.target.value))}
            className="style-num-input"
            placeholder="0"
          />
          <span className="style-border-label">px</span>
          <input
            type="color"
            value={styles.borderColor || "#e2e8f0"}
            onChange={(e) => set("borderColor", e.target.value)}
          />
          {(styles.borderWidth || styles.borderColor) && (
            <button className="style-clear-btn" onClick={() => { set("borderWidth", undefined); set("borderColor", undefined); }} title="Reset">✕</button>
          )}
        </div>
      </div>

      {/* Max Width */}
      <div className="style-row">
        <label>Max Width</label>
        <select
          value={styles.maxWidth || ""}
          onChange={(e) => set("maxWidth", e.target.value || undefined)}
          className="style-select"
        >
          <option value="">Full width</option>
          <option value="640px">Small (640px)</option>
          <option value="768px">Medium (768px)</option>
          <option value="1024px">Large (1024px)</option>
          <option value="1280px">XL (1280px)</option>
        </select>
      </div>

      {/* Text Align */}
      <div className="style-row">
        <label>Text Align</label>
        <div className="style-align-btns">
          {(["left", "center", "right"] as const).map((a) => (
            <button
              key={a}
              className={`style-align-btn ${styles.textAlign === a ? "active" : ""}`}
              onClick={() => set("textAlign", styles.textAlign === a ? undefined : a)}
              title={a}
            >
              {a === "left" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
              )}
              {a === "center" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
              )}
              {a === "right" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
