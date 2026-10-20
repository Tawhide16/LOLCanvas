"use client";

import React, { useState } from "react";
import { CanvasLayer } from "@/types";
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Crop,
  Layers,
  Trash2,
  Copy,
  Maximize2,
  AlignCenter,
  Maximize,
  Circle,
  Square,
  Sparkles,
  Flame,
  Eraser,
  Sun,
  Contrast,
  Droplet,
  EyeOff,
  Palette,
} from "lucide-react";
import { motion } from "framer-motion";
import { fabricAdapter } from "@/lib/editor/fabricAdapter";
import { applyImageFilters, removeColorBackground } from "@/lib/editor/imageFilters";
import * as fabric from "fabric";

interface ImageControlsProps {
  selectedLayer: CanvasLayer | null;
  onUpdateLayer?: (id: string, updates: Partial<CanvasLayer>) => void;
  onDeleteLayer?: (id: string) => void;
  onDuplicateLayer?: (id: string) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

export default function ImageControls({
  selectedLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  canvasWidth = 1080,
  canvasHeight = 1080,
}: ImageControlsProps) {
  const [activeTab, setActiveTab] = useState<"transform" | "filters" | "crop">("transform");

  // Filter states
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [invert, setInvert] = useState<boolean>(false);
  const [isDeepFried, setIsDeepFried] = useState<boolean>(false);

  // Background removal color
  const [chromaColor, setChromaColor] = useState<string>("#FFFFFF");
  const [chromaThreshold, setChromaThreshold] = useState<number>(30);

  if (!selectedLayer || selectedLayer.type !== "image") {
    return null;
  }

  const rotation = selectedLayer.rotation || 0;
  const scale = selectedLayer.scale || 1;
  const opacity = selectedLayer.opacity !== undefined ? selectedLayer.opacity : 1;
  const flipX = selectedLayer.flipX || false;
  const flipY = selectedLayer.flipY || false;

  const handleUpdate = (updates: Partial<CanvasLayer>) => {
    fabricAdapter.updateActiveObject(updates);
    onUpdateLayer?.(selectedLayer.id, updates);
  };

  const applyCurrentFilters = (overrides = {}) => {
    if (!fabricAdapter.canvas) return;
    const active = fabricAdapter.canvas.getActiveObject();
    if (active instanceof fabric.FabricImage) {
      applyImageFilters(active, {
        brightness,
        contrast,
        saturation,
        blur,
        grayscale,
        invert,
        isDeepFried,
        ...overrides,
      });
      fabricAdapter.canvas.requestRenderAll();
      fabricAdapter.saveHistoryState();
    }
  };

  const handleDeepFry = () => {
    const next = !isDeepFried;
    setIsDeepFried(next);
    applyCurrentFilters({ isDeepFried: next });
  };

  const handleRemoveColorBackground = () => {
    if (!fabricAdapter.canvas) return;
    const active = fabricAdapter.canvas.getActiveObject();
    if (active instanceof fabric.FabricImage) {
      removeColorBackground(active, chromaColor, chromaThreshold);
      fabricAdapter.canvas.requestRenderAll();
      fabricAdapter.saveHistoryState();
    }
  };

  return (
    <div className="bg-white border-b border-black font-mono-code text-xs select-none">
      {/* 3-Tab Switcher: Transform vs Filters vs Crop */}
      <div className="grid grid-cols-3 border-b border-black divide-x divide-black bg-[#FAF9F5] text-[10px] font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("transform")}
          className={`py-2 px-1 uppercase text-center transition-colors ${
            activeTab === "transform" ? "bg-white text-black border-b-2 border-b-black" : "text-[#777777] hover:text-black"
          }`}
        >
          TRANSFORM
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("filters")}
          className={`py-2 px-1 uppercase text-center transition-colors ${
            activeTab === "filters" ? "bg-white text-black border-b-2 border-b-black" : "text-[#777777] hover:text-black"
          }`}
        >
          FILTERS & FRY
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("crop")}
          className={`py-2 px-1 uppercase text-center transition-colors ${
            activeTab === "crop" ? "bg-white text-black border-b-2 border-b-black" : "text-[#777777] hover:text-black"
          }`}
        >
          CROP & MASK
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
        {/* Layer Header Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-black/15">
          <span className="font-bold text-[10px] text-[#E11D48] uppercase truncate max-w-[180px]">
            IMAGE: {selectedLayer.imageName || `#${selectedLayer.id.slice(-4)}`}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (onDuplicateLayer) onDuplicateLayer(selectedLayer.id);
                else fabricAdapter.duplicateSelected();
              }}
              className="p-1 hover:bg-[#FAF9F5] border border-black/20"
              title="Duplicate Image"
            >
              <Copy className="w-3 h-3 text-black" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (onDeleteLayer) onDeleteLayer(selectedLayer.id);
                else fabricAdapter.deleteSelected();
              }}
              className="p-1 hover:bg-[#E11D48] hover:text-white border border-black/20 text-[#E11D48]"
              title="Delete Image"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: TRANSFORM & ORIENTATION                                 */}
        {/* ============================================================== */}
        {activeTab === "transform" && (
          <div className="space-y-4">
            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                <span>OPACITY</span>
                <span className="text-black">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Scale Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                <span>SCALE / SIZE</span>
                <span className="text-black">{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={scale}
                onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                <span>ROTATION</span>
                <span className="text-black">{rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value, 10) })}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Quick Rotate & Flip Actions */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#777777] uppercase font-bold block">
                FLIP & ORIENTATION
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUpdate({ rotation: (rotation - 90) % 360 })}
                  className="py-1.5 bg-[#FAF9F5] border border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1 text-[10px] font-bold"
                  title="Rotate Left 90°"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>-90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate({ rotation: (rotation + 90) % 360 })}
                  className="py-1.5 bg-[#FAF9F5] border border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1 text-[10px] font-bold"
                  title="Rotate Right 90°"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>+90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate({ flipX: !flipX })}
                  className={`py-1.5 border border-black transition-colors flex items-center justify-center gap-1 text-[10px] font-bold ${
                    flipX ? "bg-black text-white" : "bg-[#FAF9F5] text-black hover:bg-black hover:text-white"
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3 h-3" />
                  <span>FLIP H</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate({ flipY: !flipY })}
                  className={`py-1.5 border border-black transition-colors flex items-center justify-center gap-1 text-[10px] font-bold ${
                    flipY ? "bg-black text-white" : "bg-[#FAF9F5] text-black hover:bg-black hover:text-white"
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-3 h-3" />
                  <span>FLIP V</span>
                </button>
              </div>
            </div>

            {/* Quick Canvas Alignments */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-[#777777] uppercase font-bold block">
                CANVAS ALIGNMENT
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fabricAdapter.alignSelected("center")}
                  className="py-1.5 px-2 bg-white border border-black hover:bg-black hover:text-white transition-colors font-bold text-[10px] uppercase text-center"
                >
                  CENTER H
                </button>
                <button
                  type="button"
                  onClick={() => fabricAdapter.alignSelected("middle")}
                  className="py-1.5 px-2 bg-white border border-black hover:bg-black hover:text-white transition-colors font-bold text-[10px] uppercase text-center"
                >
                  CENTER V
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fabricAdapter.alignSelected("center");
                    fabricAdapter.alignSelected("middle");
                  }}
                  className="py-1.5 px-2 bg-black text-white hover:bg-[#E11D48] transition-colors font-bold text-[10px] uppercase text-center"
                >
                  CENTER ALL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: FILTERS & DEEP FRY                                      */}
        {/* ============================================================== */}
        {activeTab === "filters" && (
          <div className="space-y-4">
            {/* Deep Fry Hero Button */}
            <div className="p-3 bg-[#FFF1F2] border-2 border-[#E11D48] shadow-[3px_3px_0px_0px_rgba(225,29,72,1)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-xs uppercase text-[#E11D48] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#E11D48] animate-pulse" />
                  DEEP FRY MEME FILTER
                </span>
                <span className="text-[9px] bg-[#E11D48] text-white px-1.5 py-0.5 font-bold">
                  {isDeepFried ? "CRISPY ON" : "OFF"}
                </span>
              </div>
              <p className="text-[10px] text-[#666666] leading-tight">
                Instantly cranks up saturation, contrast, and noise for authentic cursed meme aesthetics.
              </p>
              <button
                type="button"
                onClick={handleDeepFry}
                className={`w-full py-2 font-bold uppercase text-xs transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 ${
                  isDeepFried
                    ? "bg-black text-white hover:bg-[#E11D48]"
                    : "bg-[#E11D48] text-white hover:bg-black"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{isDeepFried ? "REMOVE DEEP FRY" : "🔥 MAKE IT DEEP FRIED!"}</span>
              </button>
            </div>

            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-black" />
                  BRIGHTNESS
                </span>
                <span className="text-black">{Math.round(brightness * 100)}%</span>
              </div>
              <input
                type="range"
                min="-0.8"
                max="0.8"
                step="0.05"
                value={brightness}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setBrightness(val);
                  applyCurrentFilters({ brightness: val });
                }}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                <span className="flex items-center gap-1">
                  <Contrast className="w-3 h-3 text-black" />
                  CONTRAST
                </span>
                <span className="text-black">{Math.round(contrast * 100)}%</span>
              </div>
              <input
                type="range"
                min="-0.8"
                max="0.8"
                step="0.05"
                value={contrast}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setContrast(val);
                  applyCurrentFilters({ contrast: val });
                }}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                <span className="flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-black" />
                  SATURATION
                </span>
                <span className="text-black">{Math.round(saturation * 100)}%</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1.5"
                step="0.05"
                value={saturation}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSaturation(val);
                  applyCurrentFilters({ saturation: val });
                }}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                <span>BLUR</span>
                <span className="text-black">{Math.round(blur * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={blur}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setBlur(val);
                  applyCurrentFilters({ blur: val });
                }}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Toggle Filters: Grayscale & Invert */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const next = !grayscale;
                  setGrayscale(next);
                  applyCurrentFilters({ grayscale: next });
                }}
                className={`py-2 px-3 border border-black font-bold uppercase text-[10px] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  grayscale ? "bg-black text-white" : "bg-white text-black hover:bg-[#F6F5EE]"
                }`}
              >
                GRAYSCALE
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = !invert;
                  setInvert(next);
                  applyCurrentFilters({ invert: next });
                }}
                className={`py-2 px-3 border border-black font-bold uppercase text-[10px] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  invert ? "bg-black text-white" : "bg-white text-black hover:bg-[#F6F5EE]"
                }`}
              >
                INVERT COLORS
              </button>
            </div>

            {/* Client-Side Background Removal (Chroma Key Cutout) */}
            <div className="p-3 bg-[#FAF9F5] border border-black space-y-2 pt-3">
              <span className="text-[10px] font-bold text-black uppercase flex items-center gap-1.5">
                <Eraser className="w-3.5 h-3.5 text-[#E11D48]" />
                REMOVE COLOR BACKGROUND
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={chromaColor}
                  onChange={(e) => setChromaColor(e.target.value)}
                  className="w-7 h-7 rounded-none border border-black cursor-pointer bg-white"
                  title="Pick background color to remove"
                />
                <input
                  type="text"
                  value={chromaColor}
                  onChange={(e) => setChromaColor(e.target.value)}
                  className="flex-1 bg-white border border-black px-2 py-1 text-[10px] font-bold uppercase focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleRemoveColorBackground}
                  className="px-3 py-1.5 bg-black text-white hover:bg-[#E11D48] transition-colors font-bold uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  CUTOUT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: CROP & MASK                                             */}
        {/* ============================================================== */}
        {activeTab === "crop" && (
          <div className="space-y-4">
            <span className="text-[10px] text-[#777777] uppercase font-bold block">
              QUICK MASK & ASPECT PRESETS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!fabricAdapter.canvas) return;
                  const active = fabricAdapter.canvas.getActiveObject();
                  if (active instanceof fabric.FabricImage) {
                    const radius = Math.min(active.width || 100, active.height || 100) / 2;
                    active.clipPath = new fabric.Circle({
                      radius,
                      originX: "center",
                      originY: "center",
                    });
                    fabricAdapter.canvas.requestRenderAll();
                    fabricAdapter.saveHistoryState();
                  }
                }}
                className="py-2.5 px-3 bg-white border border-black hover:bg-[#FAF9F5] font-bold uppercase text-[10px] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Circle className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>CIRCLE MASK</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!fabricAdapter.canvas) return;
                  const active = fabricAdapter.canvas.getActiveObject();
                  if (active instanceof fabric.FabricImage) {
                    active.clipPath = undefined;
                    fabricAdapter.canvas.requestRenderAll();
                    fabricAdapter.saveHistoryState();
                  }
                }}
                className="py-2.5 px-3 bg-white border border-black hover:bg-[#FAF9F5] font-bold uppercase text-[10px] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Square className="w-3.5 h-3.5 text-black" />
                <span>RESET CROP</span>
              </button>
            </div>

            <div className="p-3 bg-[#FAF9F5] border border-black text-[10px] text-[#666666] leading-relaxed">
              Use the on-canvas corner transform handles to freely crop and resize your image. Hold <strong>Shift</strong> while dragging to lock proportional dimensions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
