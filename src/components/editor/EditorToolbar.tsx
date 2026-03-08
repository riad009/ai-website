"use client";

import React from "react";
import { useEditorStore } from "@/lib/editor-store";

interface EditorToolbarProps {
  onSave: () => void;
  onPublish: () => void;
  projectName: string;
  onNameChange: (name: string) => void;
}

export default function EditorToolbar({
  onSave,
  onPublish,
  projectName,
  onNameChange,
}: EditorToolbarProps) {
  const {
    deviceMode,
    setDeviceMode,
    viewMode,
    setViewMode,
    historyIndex,
    history,
    undo,
    redo,
    isSaving,
    isDirty,
    isPublished,
  } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="editor-toolbar">
      {/* Left – project name */}
      <div className="editor-toolbar-left">
        <a href="/dashboard" className="editor-toolbar-back" title="Back to Dashboard">
          ←
        </a>
        <input
          className="editor-toolbar-name"
          value={projectName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Project Name"
        />
      </div>

      {/* Center – view & device toggles */}
      <div className="editor-toolbar-center">
        {/* Undo / Redo */}
        <div className="editor-toolbar-group">
          <button
            className="editor-tb-btn"
            disabled={!canUndo}
            onClick={undo}
            title="Undo (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            className="editor-tb-btn"
            disabled={!canRedo}
            onClick={redo}
            title="Redo (Ctrl+Y)"
          >
            ↪
          </button>
        </div>

        <span className="editor-tb-divider" />

        {/* View mode */}
        <div className="editor-toolbar-group">
          {(["edit", "split", "preview"] as const).map((m) => (
            <button
              key={m}
              className={`editor-tb-btn ${m === "edit" ? "select-mode" : ""} ${viewMode === m ? "active" : ""}`}
              onClick={() => setViewMode(m)}
            >
              {m === "edit" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 2l7.5 18.5L13 13l7.5-2.5z" /></svg>
              ) : m === "split" ? "⬜" : "👁️"}
              <span className="editor-tb-btn-label">{m === "edit" ? "Select" : m.charAt(0).toUpperCase() + m.slice(1)}</span>
            </button>
          ))}
        </div>

        <span className="editor-tb-divider" />

        {/* Device preview */}
        <div className="editor-toolbar-group">
          {(["desktop", "tablet", "mobile"] as const).map((d) => (
            <button
              key={d}
              className={`editor-tb-btn ${deviceMode === d ? "active" : ""}`}
              onClick={() => setDeviceMode(d)}
            >
              {d === "desktop" ? "🖥️" : d === "tablet" ? "📱" : "📲"}
            </button>
          ))}
        </div>
      </div>

      {/* Right – save / publish */}
      <div className="editor-toolbar-right">
        {isSaving && <span className="editor-toolbar-status">Saving…</span>}
        {isDirty && !isSaving && <span className="editor-toolbar-status unsaved">Unsaved</span>}
        <button className="editor-tb-btn save" onClick={onSave} disabled={isSaving}>
          💾 Save
        </button>
        <button className="editor-tb-btn publish" onClick={onPublish}>
          🚀 {isPublished ? "Update" : "Publish"}
        </button>
      </div>
    </div>
  );
}
