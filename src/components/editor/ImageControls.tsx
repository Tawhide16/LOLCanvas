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
} from "lucide-react";
import { motion } from "framer-motion";

interface ImageControlsProps {
  selectedLayer: CanvasLayer | null;
  onUpdateLayer: (id: string, updates: Partial<CanvasLayer>) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export default function ImageControls({
  selectedLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  canvasWidth,
  canvasHeight,
}: ImageControlsProps) {
  const [activeTab, setActiveTab] = useState<"transform" | "crop">("transform");

  if (!selectedLayer || selectedLayer.type !== "image") {
    return null;
  }

  const rotation = selectedLayer.rotation || 0;
  const scale = selectedLayer.scale || 1;
  const opacity = selectedLayer.opacity !== undefined ? selectedLayer.opacity : 1;
  const flipX = selectedLayer.flipX || false;
  const flipY = selectedLayer.flipY || false;

  const cropX = selectedLayer.cropX || 0;
  const cropY = selectedLayer.cropY || 0;
  const cropWidth = selectedLayer.cropWidth || 100;
  const cropHeight = selectedLayer.cropHeight || 100;

  return (
    <div className="bg-white border-b border-black font-mono-code text-xs">
      {/* Tab Switcher: Transform vs Crop */}
      <div className="grid grid-cols-2 border-b border-black divide-x divide-black bg-[#FAF9F5]">
        <button
          onClick={() => setActiveTab("transform")}
          className={`py-2 px-3 uppercase font-bold text-center transition-colors ${
            activeTab === "transform" ? "bg-white text-black border-b-2 border-b-black" : "text-[#777777] hover:text-black"
          }`}
        >
          TRANSFORM & ROTATE
        </button>
        <button
          onClick={() => setActiveTab("crop")}
          className={`py-2 px-3 uppercase font-bold text-center transition-colors ${
            activeTab === "crop" ? "bg-white text-black border-b-2 border-b-black" : "text-[#777777] hover:text-black"
          }`}
        >
          CROP & MASK
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Layer Header Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-black/15">
          <span className="font-bold text-[10px] text-[#E11D48] uppercase truncate max-w-[180px]">
            IMAGE: {selectedLayer.imageName || `#${selectedLayer.id.slice(-4)}`}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onDuplicateLayer(selectedLayer.id)}
              className="p-1 hover:bg-[#FAF9F5] border border-black/20"
              title="Duplicate Image"
            >
              <Copy className="w-3 h-3 text-black" />
            </button>
            <button
              onClick={() => onDeleteLayer(selectedLayer.id)}
              className="p-1 hover:bg-[#E11D48] hover:text-white border border-black/20 text-[#E11D48]"
              title="Delete Image"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {activeTab === "transform" ? (
          <div className="space-y-4">
            {/* 1. Scale / Size Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                <span>SCALE / SIZE</span>
                <span className="text-black">{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.05"
                value={scale}
                onChange={(e) =>
                  onUpdateLayer(selectedLayer.id, { scale: parseFloat(e.target.value) })
                }
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* 2. Rotate Slider & Quick Angle Presets */}
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
                onChange={(e) =>
                  onUpdateLayer(selectedLayer.id, { rotation: parseInt(e.target.value, 10) })
                }
                className="w-full accent-black cursor-pointer"
              />

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button
                  onClick={() =>
                    onUpdateLayer(selectedLayer.id, {
                      rotation: ((rotation - 90 + 180) % 360) - 180,
                    })
                  }
                  className="py-1 px-1 bg-[#FAF9F5] border border-black text-[10px] font-bold text-center hover:bg-black hover:text-white transition-colors"
                >
                  -90°
                </button>
                <button
                  onClick={() => onUpdateLayer(selectedLayer.id, { rotation: 0 })}
                  className="py-1 px-1 bg-[#FAF9F5] border border-black text-[10px] font-bold text-center hover:bg-black hover:text-white transition-colors"
                >
                  0°
                </button>
                <button
                  onClick={() =>
                    onUpdateLayer(selectedLayer.id, {
                      rotation: ((rotation + 90 + 180) % 360) - 180,
                    })
                  }
                  className="py-1 px-1 bg-[#FAF9F5] border border-black text-[10px] font-bold text-center hover:bg-black hover:text-white transition-colors"
                >
                  +90°
                </button>
                <button
                  onClick={() => onUpdateLayer(selectedLayer.id, { rotation: 180 })}
                  className="py-1 px-1 bg-[#FAF9F5] border border-black text-[10px] font-bold text-center hover:bg-black hover:text-white transition-colors"
                >
                  180°
                </button>
              </div>
            </div>

            {/* 3. Position X & Y Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                  <span>POS X</span>
                  <span className="text-black">{selectedLayer.x}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedLayer.x}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { x: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                  <span>POS Y</span>
                  <span className="text-black">{selectedLayer.y}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedLayer.y}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { y: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Center Alignment Button */}
            <button
              onClick={() => onUpdateLayer(selectedLayer.id, { x: 50, y: 50 })}
              className="w-full py-1.5 bg-[#FAF9F5] border border-black hover:bg-black hover:text-white transition-colors text-[10px] font-bold uppercase flex items-center justify-center gap-1.5"
            >
              <AlignCenter className="w-3.5 h-3.5" />
              <span>SNAP TO CANVAS CENTER</span>
            </button>

            {/* 4. Flip Controls */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/15">
              <button
                onClick={() => onUpdateLayer(selectedLayer.id, { flipX: !flipX })}
                className={`py-2 px-2 border text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 transition-colors ${
                  flipX ? "bg-black text-white border-black" : "bg-white border-black hover:bg-[#F6F5EE]"
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>FLIP HORIZ</span>
              </button>

              <button
                onClick={() => onUpdateLayer(selectedLayer.id, { flipY: !flipY })}
                className={`py-2 px-2 border text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 transition-colors ${
                  flipY ? "bg-black text-white border-black" : "bg-white border-black hover:bg-[#F6F5EE]"
                }`}
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>FLIP VERT</span>
              </button>
            </div>

            {/* 5. Opacity Slider */}
            <div className="space-y-1 pt-1 border-t border-black/15">
              <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                <span>OPACITY</span>
                <span className="text-black">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) =>
                  onUpdateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })
                }
                className="w-full accent-black cursor-pointer"
              />
            </div>
          </div>
        ) : (
          /* CROP TAB */
          <div className="space-y-4">
            <div className="text-[10px] text-[#777777] uppercase font-bold">
              CROP & MASKING CONTROLS
            </div>

            {/* Quick Crop Presets */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() =>
                  onUpdateLayer(selectedLayer.id, {
                    cropX: 0,
                    cropY: 0,
                    cropWidth: 100,
                    cropHeight: 100,
                  })
                }
                className="py-2 px-1 bg-[#FAF9F5] border border-black hover:bg-black hover:text-white transition-colors text-[10px] font-bold text-center"
              >
                FULL (RESET)
              </button>
              <button
                onClick={() =>
                  onUpdateLayer(selectedLayer.id, {
                    cropX: 10,
                    cropY: 10,
                    cropWidth: 80,
                    cropHeight: 80,
                  })
                }
                className="py-2 px-1 bg-[#FAF9F5] border border-black hover:bg-black hover:text-white transition-colors text-[10px] font-bold text-center"
              >
                1:1 SQUARE
              </button>
              <button
                onClick={() =>
                  onUpdateLayer(selectedLayer.id, {
                    cropX: 0,
                    cropY: 20,
                    cropWidth: 100,
                    cropHeight: 60,
                  })
                }
                className="py-2 px-1 bg-[#FAF9F5] border border-black hover:bg-black hover:text-white transition-colors text-[10px] font-bold text-center"
              >
                16:9 WIDE
              </button>
            </div>

            {/* Granular Crop Sliders */}
            <div className="space-y-2 pt-2 border-t border-black/15">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#777777]">
                  <span>CROP LEFT / RIGHT (WIDTH)</span>
                  <span className="font-bold text-black">{cropWidth}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={cropWidth}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { cropWidth: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#777777]">
                  <span>CROP TOP / BOTTOM (HEIGHT)</span>
                  <span className="font-bold text-black">{cropHeight}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={cropHeight}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { cropHeight: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#777777]">
                  <span>HORIZONTAL OFFSET</span>
                  <span className="font-bold text-black">{cropX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={cropX}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { cropX: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#777777]">
                  <span>VERTICAL OFFSET</span>
                  <span className="font-bold text-black">{cropY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={cropY}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { cropY: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
