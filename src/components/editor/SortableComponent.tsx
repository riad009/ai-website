"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditorStore, COMPONENT_REGISTRY } from "@/lib/editor-store";
import type { ComponentData } from "@/types/editor";

interface SortableComponentProps {
  component: ComponentData;
  children: React.ReactNode;
}

// Tags considered selectable micro-elements
const MICRO_TAGS = new Set(["BUTTON", "A", "H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "IMG", "INPUT", "LABEL", "LI", "TD", "TH"]);

function getReadableTag(tag: string): string {
  const map: Record<string, string> = {
    BUTTON: "Button", A: "Link", H1: "Heading", H2: "Heading", H3: "Heading",
    H4: "Heading", H5: "Heading", H6: "Heading", P: "Paragraph", SPAN: "Text",
    IMG: "Image", INPUT: "Input", LABEL: "Label", LI: "List Item", TD: "Cell", TH: "Header Cell",
  };
  return map[tag] || tag;
}

export default function SortableComponent({ component, children }: SortableComponentProps) {
  const {
    selectedComponentIds,
    toggleSelectComponent,
    removeComponent,
    duplicateComponent,
    viewMode,
    setMicroElement,
  } = useEditorStore();
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedComponentIds.includes(component.id);
  const isSelectMode = viewMode === "edit";
  const def = COMPONENT_REGISTRY.find((c) => c.type === component.type);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    position: "relative",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isSelectMode) return;

    // Check if a micro-element was clicked
    const target = e.target as HTMLElement;
    const sectionRoot = e.currentTarget as HTMLElement;

    // Walk up from the clicked element to find the nearest selectable micro-element
    let el: HTMLElement | null = target;
    while (el && el !== sectionRoot) {
      if (MICRO_TAGS.has(el.tagName)) {
        // Found a micro-element!
        const text = el.textContent?.trim().slice(0, 50) || "";
        setMicroElement({
          tag: getReadableTag(el.tagName),
          text: text || `(${el.tagName.toLowerCase()})`,
          sectionId: component.id,
        });

        // Also make sure the section is selected
        if (!selectedComponentIds.includes(component.id)) {
          toggleSelectComponent(component.id);
        }
        return;
      }
      el = el.parentElement;
    }

    // No micro-element found, toggle section selection
    toggleSelectComponent(component.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`edc-section ${hovered ? "hovered" : ""} ${isSelected ? "selected" : ""} ${isDragging ? "dragging" : ""} ${isSelectMode ? "select-enabled" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* ── Hover label (shows section type on hover) ── */}
      {(hovered || isSelected) && isSelectMode && (
        <div className={`edc-label ${isSelected ? "edc-label-selected" : ""}`}>
          <span className="edc-label-icon">{def?.icon || "📦"}</span>
          <span className="edc-label-text">{def?.label || component.type}</span>
          {isSelected && <span className="edc-label-check">✓</span>}
        </div>
      )}

      {/* ── Top toolbar (on select) ── */}
      {isSelected && isSelectMode && (
        <div className="edc-toolbar">
          <span className="edc-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
            </svg>
          </span>
          <button onClick={(e) => { e.stopPropagation(); duplicateComponent(component.id); }} title="Duplicate section" className="edc-tb-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); removeComponent(component.id); }} title="Delete section" className="edc-tb-btn edc-tb-danger">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
          </button>
        </div>
      )}

      {/* ── Rendered component ── */}
      <div className="edc-body">{children}</div>
    </div>
  );
}
