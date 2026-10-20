"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import { fabricAdapter } from "@/lib/editor/fabricAdapter";
import { useEditorStore } from "@/lib/editor/editorStore";
import { Maximize, ZoomIn, ZoomOut, RotateCcw, Hand, MousePointer, Grid } from "lucide-react";
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

  // Pan states
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const startPanRef = useRef({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Touch pinch states
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);

  const width = useEditorStore((s) => s.width);
  const height = useEditorStore((s) => s.height);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
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
      const existing = fabricAdapter.canvas.getObjects().find((o: any) => o.isBaseTemplate);
      if (!existing) {
        fabric.FabricImage.fromURL(targetUrl, { crossOrigin: "anonymous" })
          .then((img) => {
            if (!fabricAdapter.canvas) return;
            (img as any).id = "base_template_img";
            (img as any).name = template?.title || "Base Template";
            (img as any).isBaseTemplate = true;

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

  // Fit to screen helper
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const padding = 64;
    const availableWidth = containerRef.current.clientWidth - padding;
    const availableHeight = containerRef.current.clientHeight - padding;

    if (availableWidth > 0 && availableHeight > 0) {
      const scaleX = availableWidth / width;
      const scaleY = availableHeight / height;
      const bestZoom = Math.min(scaleX, scaleY, 1.2);
      setZoom(+bestZoom.toFixed(2));
      setPanOffset({ x: 0, y: 0 });
    }
  }, [width, height, setZoom]);

  // Initial fit to screen on mount
  useEffect(() => {
    if (isReady) {
      handleFitToScreen();
    }
  }, [isReady]);

  // Wheel Zoom handler (Ctrl+Wheel or standard Wheel zoom)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || isSpacePressed) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((z) => Math.min(3.0, Math.max(0.2, +(z + delta).toFixed(2))));
    } else {
      // Pan with trackpad or mouse wheel
      setPanOffset((p) => ({
        x: p.x - e.deltaX * 0.7,
        y: p.y - e.deltaY * 0.7,
      }));
    }
  };

  // Mouse pan (Space + Drag or Middle Click)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
  };

  // Touch handlers for mobile pinch & pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDistRef.current;
      const newZoom = Math.min(3.0, Math.max(0.25, +(touchStartZoomRef.current * ratio).toFixed(2)));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  // Keyboard listener for Space bar pan mode & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.code === "Space" && !isSpacePressed) {
        setIsSpacePressed(true);
      }

      // Check if text editing is active
      if (fabricAdapter.canvas) {
        const active = fabricAdapter.canvas.getActiveObject();
        if (active instanceof fabric.Textbox && (active as any).isEditing) {
          return;
        }
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        const prevStep = useEditorStore.getState().undo();
        if (prevStep) fabricAdapter.loadFromHistory(prevStep);
        return;
      }

      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        const nextStep = useEditorStore.getState().redo();
        if (nextStep) fabricAdapter.loadFromHistory(nextStep);
        return;
      }

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        fabricAdapter.deleteSelected();
        return;
      }

      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        fabricAdapter.duplicateSelected();
        return;
      }

      // Select All: Ctrl+A
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

      // Nudge
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

      // Escape
      if (e.key === "Escape") {
        e.preventDefault();
        fabricAdapter.canvas?.discardActiveObject();
        fabricAdapter.canvas?.requestRenderAll();
        return;
      }

      // Shortcuts modal: "?"
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const current = useEditorStore.getState().showShortcutsModal;
        useEditorStore.getState().setShowShortcutsModal(!current);
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSpacePressed]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative flex-1 w-full h-full min-h-[500px] flex items-center justify-center p-4 md:p-8 overflow-hidden select-none bg-[#E6E4DC] ${
        isSpacePressed || isPanning ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        backgroundImage: isGridVisible
          ? "radial-gradient(#000000 1px, transparent 1px)"
          : undefined,
        backgroundSize: isGridVisible ? "24px 24px" : undefined,
      }}
    >
      {/* Zoom and Transform wrapper */}
      <div
        className="transition-transform duration-75 origin-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black bg-white"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
        }}
      >
        <canvas ref={canvasElRef} width={width} height={height} />
      </div>

      {/* Floating Canvas HUD (Bottom Left & Right controls) */}
      <div className="absolute bottom-4 left-4 z-40 hidden sm:flex items-center gap-1.5 p-1 bg-white border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-mono-code text-[11px] font-bold">
        <span className="px-2 text-[#777777]">
          {width} × {height} PX
        </span>
        <span className="text-black/30">|</span>
        <button
          type="button"
          onClick={() => {
            setPanOffset({ x: 0, y: 0 });
            handleFitToScreen();
          }}
          className="px-2 py-1 bg-[#FAF9F5] hover:bg-black hover:text-white border border-black/40 uppercase transition-colors flex items-center gap-1"
          title="Fit Canvas to Viewport"
        >
          <Maximize className="w-3 h-3 text-[#E11D48]" />
          <span>FIT</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="px-2 py-1 bg-[#FAF9F5] hover:bg-black hover:text-white border border-black/40 uppercase transition-colors"
          title="Reset 100%"
        >
          100%
        </button>
      </div>

      {/* Floating Zoom & Pan Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-40 flex items-center gap-1 p-1 bg-white border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-mono-code text-xs">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.2, +(z - 0.15).toFixed(2)))}
          className="p-1.5 hover:bg-[#F6F5EE] border border-transparent hover:border-black transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5 text-black" />
        </button>
        <span className="px-2 font-bold min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3.0, +(z + 0.15).toFixed(2)))}
          className="p-1.5 hover:bg-[#F6F5EE] border border-transparent hover:border-black transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5 text-black" />
        </button>
      </div>
    </div>
  );
}
