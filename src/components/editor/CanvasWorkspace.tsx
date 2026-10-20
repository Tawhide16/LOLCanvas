"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { fabricAdapter } from "@/lib/editor/fabricAdapter";
import { useEditorStore } from "@/lib/editor/editorStore";
import type { Template } from "@/types";

interface CanvasWorkspaceProps {
  template: Template | null;
  backgroundImageUrl?: string | null;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
}

export default function CanvasWorkspace({
  template,
  backgroundImageUrl,
  onCanvasReady,
}: CanvasWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  const width = useEditorStore((s) => s.width);
  const height = useEditorStore((s) => s.height);
  const zoom = useEditorStore((s) => s.zoom);
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const isGridVisible = useEditorStore((s) => s.isGridVisible);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = fabricAdapter.init(canvasElRef.current, width, height, backgroundColor);
    setIsReady(true);
    onCanvasReady?.(canvas);

    return () => {
      fabricAdapter.destroy();
      setIsReady(false);
    };
  }, []);

  // Update canvas dimensions when store dimensions change
  useEffect(() => {
    if (!isReady) return;
    fabricAdapter.setDimensions(width, height);
  }, [width, height, isReady]);

  // Update background color when store changes
  useEffect(() => {
    if (!isReady) return;
    fabricAdapter.setBackgroundColor(backgroundColor);
  }, [backgroundColor, isReady]);

  // Load template or custom background image when prop changes
  useEffect(() => {
    if (!isReady || !fabricAdapter.canvas) return;

    const targetUrl = backgroundImageUrl || template?.originalUrl || template?.svgDataUri;
    if (targetUrl && targetUrl !== "blank-canvas") {
      // Check if image layer already exists to prevent duplicate loading
      const existing = fabricAdapter.canvas.getObjects().find((o: any) => o.isBaseTemplate);
      if (!existing) {
        fabric.FabricImage.fromURL(targetUrl, { crossOrigin: "anonymous" })
          .then((img) => {
            if (!fabricAdapter.canvas) return;
            (img as any).id = "base_template_img";
            (img as any).name = template?.title || "Base Template";
            (img as any).isBaseTemplate = true;

            // Scale to fit canvas nicely
            const scaleX = width / (img.width || 1);
            const scaleY = height / (img.height || 1);
            const scale = Math.min(scaleX, scaleY);

            img.set({
              left: width / 2,
              top: height / 2,
              originX: "center",
              originY: "center",
              scaleX: scale,
              scaleY: scale,
            });

            fabricAdapter.canvas.add(img);
            fabricAdapter.canvas.sendObjectToBack(img);
            fabricAdapter.canvas.requestRenderAll();
            fabricAdapter.syncLayersToStore();
            fabricAdapter.saveHistoryState();
          })
          .catch((err) => console.error("Could not load template image into canvas:", err));
      }
    }
  }, [template, backgroundImageUrl, isReady, width, height]);

  // Global Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an HTML input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // Check if an inline Fabric text editing session is currently active
      if (fabricAdapter.canvas) {
        const active = fabricAdapter.canvas.getActiveObject();
        if (active instanceof fabric.Textbox && (active as any).isEditing) {
          return;
        }
      }

      // 1. Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        const prevStep = useEditorStore.getState().undo();
        if (prevStep) {
          fabricAdapter.loadFromHistory(prevStep);
        }
        return;
      }

      // 2. Redo: Ctrl+Shift+Z or Ctrl+Y
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        const nextStep = useEditorStore.getState().redo();
        if (nextStep) {
          fabricAdapter.loadFromHistory(nextStep);
        }
        return;
      }

      // 3. Delete / Backspace: Delete active selection
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        fabricAdapter.deleteSelected();
        return;
      }

      // 4. Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        fabricAdapter.duplicateSelected();
        return;
      }

      // 5. Select All: Ctrl+A
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        if (fabricAdapter.canvas) {
          const selectableObjs = fabricAdapter.canvas.getObjects().filter((o) => !o.lockMovementX && o.visible !== false);
          if (selectableObjs.length > 0) {
            const sel = new fabric.ActiveSelection(selectableObjs, { canvas: fabricAdapter.canvas });
            fabricAdapter.canvas.setActiveObject(sel);
            fabricAdapter.canvas.requestRenderAll();
          }
        }
        return;
      }

      // 6. Nudge with Arrow Keys
      const nudgeAmount = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        fabricAdapter.nudgeSelected(-nudgeAmount, 0);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        fabricAdapter.nudgeSelected(nudgeAmount, 0);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        fabricAdapter.nudgeSelected(0, -nudgeAmount);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        fabricAdapter.nudgeSelected(0, nudgeAmount);
        return;
      }

      // 7. Deselect: Escape
      if (e.key === "Escape") {
        e.preventDefault();
        fabricAdapter.canvas?.discardActiveObject();
        fabricAdapter.canvas?.requestRenderAll();
        return;
      }

      // 8. Shortcuts modal toggle: "?"
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const current = useEditorStore.getState().showShortcutsModal;
        useEditorStore.getState().setShowShortcutsModal(!current);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full min-h-[500px] flex items-center justify-center p-4 md:p-8 overflow-auto select-none bg-[#E6E4DC]"
      style={{
        backgroundImage: isGridVisible
          ? "radial-gradient(#000000 1px, transparent 1px)"
          : undefined,
        backgroundSize: isGridVisible ? "20px 20px" : undefined,
      }}
    >
      {/* Zoom and Transform wrapper */}
      <div
        className="transition-transform duration-75 origin-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black bg-white"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${zoom})`,
        }}
      >
        <canvas ref={canvasElRef} width={width} height={height} />
      </div>
    </div>
  );
}
