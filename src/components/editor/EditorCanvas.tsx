"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEditorStore } from "@/lib/editor-store";
import SortableComponent from "./SortableComponent";
import RenderComponent from "./RenderComponent";

const DEVICE_WIDTHS: Record<string, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 375,
};

export default function EditorCanvas() {
  const { components, deviceMode, viewMode, moveComponent, clearSelection, addComponent } =
    useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = components.findIndex((c) => c.id === active.id);
    const newIdx = components.findIndex((c) => c.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      moveComponent(oldIdx, newIdx);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("component-type");
    if (type) addComponent(type);
  };

  const width = DEVICE_WIDTHS[deviceMode] || 1280;
  const isPreview = viewMode === "preview";

  return (
    <div
      className="editor-canvas-wrapper"
      onClick={() => clearSelection()}
    >
      <div
        className={`editor-canvas-frame ${deviceMode}`}
        style={{ maxWidth: deviceMode === "desktop" ? "100%" : width }}
      >
        <div
          className="editor-canvas-content"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {components.length === 0 && (
            <div className="editor-canvas-empty">
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎨</div>
              <h3>Start Building</h3>
              <p>
                Drag components from the sidebar or click them to add to your
                page.
              </p>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={components.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {components.map((comp) =>
                isPreview ? (
                  <RenderComponent
                    key={comp.id}
                    component={comp}
                    isPreview
                  />
                ) : (
                  <SortableComponent key={comp.id} component={comp}>
                    <RenderComponent component={comp} />
                  </SortableComponent>
                )
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
