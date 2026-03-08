"use client";

import React from "react";
import { useEditorStore, getNestedValue } from "@/lib/editor-store";

export default function ElementStylePanel() {
  const {
    selectedComponentId,
    selectedElementPath,
    components,
    updateElementProp,
    deleteElement,
    addElement,
    duplicateElement,
    selectElement,
  } = useEditorStore();

  const component = components.find((c) => c.id === selectedComponentId);
  if (!component || !selectedElementPath) return null;

  const element = getNestedValue(component.props, selectedElementPath);
  if (element === undefined || element === null) return null;

  // Determine if this is an array item (path ends with a number)
  const pathParts = selectedElementPath.split(".");
  const lastPart = pathParts[pathParts.length - 1];
  const isArrayItem = !isNaN(Number(lastPart));
  const arrayPath = isArrayItem ? pathParts.slice(0, -1).join(".") : null;
  const parentArray = arrayPath ? getNestedValue(component.props, arrayPath) : null;

  // Build a readable label
  const elementLabel = (() => {
    if (typeof element === "string") return selectedElementPath;
    if (typeof element === "object" && !Array.isArray(element)) {
      return element.name || element.title || element.label || element.question || selectedElementPath;
    }
    return selectedElementPath;
  })();

  return (
    <div className="el-panel">
      {/* Header with back button */}
      <div className="el-panel-header">
        <button
          className="el-panel-back"
          onClick={() => selectElement(component.id, null)}
          title="Back to section"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="el-panel-title">
          <span className="el-panel-badge">Element</span>
          <h4>{elementLabel}</h4>
        </div>
      </div>

      {/* Actions bar for array items */}
      {isArrayItem && arrayPath && (
        <div className="el-panel-actions">
          <button
            className="el-action-btn el-action-dup"
            onClick={() => duplicateElement(component.id, selectedElementPath)}
            title="Duplicate"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Duplicate
          </button>
          <button
            className="el-action-btn el-action-add"
            onClick={() => addElement(component.id, arrayPath)}
            title="Add new"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add New
          </button>
          <button
            className="el-action-btn el-action-del"
            onClick={() => {
              if (parentArray && parentArray.length <= 1) return; // prevent deleting last item
              deleteElement(component.id, selectedElementPath);
            }}
            disabled={parentArray && parentArray.length <= 1}
            title={parentArray && parentArray.length <= 1 ? "Can't delete last item" : "Delete"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
            Delete
          </button>
        </div>
      )}

      {/* Item index indicator */}
      {isArrayItem && parentArray && (
        <div className="el-panel-nav">
          <button
            className="el-nav-btn"
            disabled={Number(lastPart) === 0}
            onClick={() => {
              const newIdx = Number(lastPart) - 1;
              selectElement(component.id, `${arrayPath}.${newIdx}`);
            }}
          >
            ‹ Prev
          </button>
          <span className="el-nav-label">{Number(lastPart) + 1} / {parentArray.length}</span>
          <button
            className="el-nav-btn"
            disabled={Number(lastPart) >= parentArray.length - 1}
            onClick={() => {
              const newIdx = Number(lastPart) + 1;
              selectElement(component.id, `${arrayPath}.${newIdx}`);
            }}
          >
            Next ›
          </button>
        </div>
      )}

      {/* Property editors */}
      <div className="el-panel-body">
        {typeof element === "string" ? (
          <div className="el-field">
            <label>Text</label>
            {element.length > 80 ? (
              <textarea
                value={element}
                onChange={(e) => updateElementProp(component.id, selectedElementPath, "", e.target.value)}
                className="el-textarea"
                rows={3}
              />
            ) : (
              <input
                type="text"
                value={element}
                onChange={(e) => updateElementProp(component.id, selectedElementPath, "", e.target.value)}
                className="el-input"
              />
            )}
          </div>
        ) : typeof element === "object" && !Array.isArray(element) ? (
          Object.entries(element).map(([key, value]) => (
            <ElementField
              key={key}
              label={key}
              value={value}
              onChange={(v) => updateElementProp(component.id, selectedElementPath, key, v)}
            />
          ))
        ) : null}
      </div>
    </div>
  );
}

// ── Individual Field Editor ──
function ElementField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
}) {
  if (value === null || value === undefined) return null;

  const displayLabel = label
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();

  // Color fields
  if (typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value)) {
    return (
      <div className="el-field">
        <label>{displayLabel}</label>
        <div className="el-color-row">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="el-color-picker" />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="el-input el-input-sm" />
        </div>
      </div>
    );
  }

  // Boolean
  if (typeof value === "boolean") {
    return (
      <div className="el-field el-field-row">
        <label>{displayLabel}</label>
        <button
          className={`el-toggle ${value ? "active" : ""}`}
          onClick={() => onChange(!value)}
        >
          <span className="el-toggle-knob" />
        </button>
      </div>
    );
  }

  // Number
  if (typeof value === "number") {
    return (
      <div className="el-field">
        <label>{displayLabel}</label>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="el-input" />
      </div>
    );
  }

  // String array (like features in pricing plans)
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return (
      <div className="el-field">
        <label>{displayLabel} ({value.length})</label>
        <div className="el-string-list">
          {value.map((item, i) => (
            <div key={i} className="el-string-item">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const next = [...value];
                  next[i] = e.target.value;
                  onChange(next);
                }}
                className="el-input el-input-sm"
              />
              <button
                className="el-remove-btn"
                onClick={() => {
                  const next = [...value];
                  next.splice(i, 1);
                  onChange(next);
                }}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="el-add-item-btn"
            onClick={() => onChange([...value, ""])}
          >
            + Add
          </button>
        </div>
      </div>
    );
  }

  // Nested arrays (skip deep nesting)
  if (Array.isArray(value)) {
    return (
      <div className="el-field">
        <label>{displayLabel} ({value.length} items)</label>
        <span className="el-hint">Edit items on canvas</span>
      </div>
    );
  }

  // Nested objects
  if (typeof value === "object") {
    return (
      <div className="el-field">
        <label>{displayLabel}</label>
        <div className="el-nested">
          {Object.entries(value).map(([k, v]) => (
            <ElementField
              key={k}
              label={k}
              value={v}
              onChange={(newV) => onChange({ ...value, [k]: newV })}
            />
          ))}
        </div>
      </div>
    );
  }

  // String (default)
  if (typeof value === "string") {
    const isLong = value.length > 80;
    return (
      <div className="el-field">
        <label>{displayLabel}</label>
        {isLong ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="el-textarea"
            rows={3}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="el-input"
          />
        )}
      </div>
    );
  }

  return null;
}
