"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEditorStore } from "@/lib/editor-store";
import ComponentLibrary from "@/components/editor/ComponentLibrary";
import EditorToolbar from "@/components/editor/EditorToolbar";
import EditorCanvas from "@/components/editor/EditorCanvas";
import PropertyPanel from "@/components/editor/PropertyPanel";
import PublishModal from "@/components/editor/PublishModal";
import type { ComponentData } from "@/types/editor";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [showPublish, setShowPublish] = useState(false);
  const [showProps, setShowProps] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    init,
    components,
    projectName,
    setProjectName,
    viewMode,
    isDirty,
    setDirty,
    setSaving,
    isSaving,
    addComponent,
    undo,
    redo,
  } = useEditorStore();

  // ── Load project ──
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;

    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          router.push("/dashboard");
          return;
        }
        const data = await res.json();

        // Build component list — prefer editor_data, fallback to legacy content.sections
        let comps: ComponentData[] = [];
        if (data.editor_data) {
          comps = typeof data.editor_data === "string" ? JSON.parse(data.editor_data) : data.editor_data;
        } else if (data.content?.sections) {
          // Convert old WebsiteData sections to ComponentData
          comps = data.content.sections.map((s: any) => ({
            id: s.id || `comp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: s.type,
            props: s.content || {},
          }));
        }

        init({
          projectId: data.id,
          projectName: data.name,
          category: data.category,
          components: comps,
          isPublished: data.is_published || false,
          subdomain: data.subdomain || "",
          customDomain: data.custom_domain || "",
          publishedAt: data.published_at || null,
        });
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, status]);

  // ── Auto-save ──
  useEffect(() => {
    if (!isDirty || loading) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveProject();
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [components, isDirty]);

  const saveProject = useCallback(async () => {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          editor_data: JSON.stringify(components),
        }),
      });
      setDirty(false);
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
    }
  }, [projectId, projectName, components]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, saveProject]);

  if (loading) {
    return (
      <div className="editor-loading">
        <div className="editor-loading-spinner" />
        <p>Loading editor…</p>
      </div>
    );
  }

  const showLibrary = viewMode === "edit" || viewMode === "split";

  return (
    <div className="editor-root">
      <EditorToolbar
        onSave={saveProject}
        onPublish={() => setShowPublish(true)}
        projectName={projectName}
        onNameChange={setProjectName}
      />

      <div className="editor-body">
        {showLibrary && (
          <aside className="editor-sidebar-left">
            <ComponentLibrary onAdd={(type) => addComponent(type)} projectId={projectId} userId={session?.user?.id} />
          </aside>
        )}

        <main className={`editor-main ${viewMode}`}>
          <EditorCanvas />
        </main>

        {/* Property Panel - slides in from right */}
        {showProps && (
          <aside className="editor-sidebar-right editor-props-slide">
            <div className="editor-props-top-header">
              <span>🎨 Edit Properties</span>
              <button className="editor-props-close" onClick={() => setShowProps(false)}>✕</button>
            </div>
            <PropertyPanel />
          </aside>
        )}
      </div>

      {showPublish && <PublishModal onClose={() => setShowPublish(false)} />}

      {/* Right-edge pencil toggle for Property Panel */}
      <button
        className={`editor-pencil-toggle ${showProps ? "active" : ""}`}
        onClick={() => setShowProps(!showProps)}
        title={showProps ? "Close editing panel" : "Open editing panel"}
      >
        ✏️
      </button>
    </div>
  );
}
