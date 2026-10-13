"use client";

import React, { useState } from "react";
import { CanvasLayer } from "@/types";
import { AlignLeft, AlignCenter, AlignRight, Type, Stamp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TextControlsProps {
  selectedLayer: CanvasLayer | null;
  onUpdateLayer: (id: string, updates: Partial<CanvasLayer>) => void;
  onAddTextLayer: (initialText?: string, yPos?: number) => void;
  onAddSticker: (symbol: string) => void;
}

const FONT_OPTIONS = [
  { label: "Impact", value: "Impact" },
  { label: "Space Grotesk", value: "Space Grotesk" },
  { label: "Space Mono", value: "Space Mono" },
  { label: "Inter", value: "Inter" },
  { label: "Arial Black", value: "Arial Black" },
  { label: "Comic Sans MS", value: "Comic Sans MS" },
];

const COLOR_PRESETS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Black", value: "#000000" },
  { label: "Crimson", value: "#E11D48" },
  { label: "Yellow", value: "#FACC15" },
  { label: "Cyan", value: "#06B6D4" },
  { label: "Green", value: "#10B981" },
];

const STAMPS = ["VERIFIED", "CERTIFIED", "CONFIDENTIAL", "VIRAL", "BASED"];

export default function TextControls({
  selectedLayer,
  onUpdateLayer,
  onAddTextLayer,
  onAddSticker,
}: TextControlsProps) {
  const [activeTab, setActiveTab] = useState<"text" | "stamps">("text");

  return (
    <div className="bg-white border-b border-black font-mono-code text-xs">
      {/* Animated Tab Bar */}
      <div className="grid grid-cols-2 border-b border-black divide-x divide-black bg-[#FAF9F5]">
        <button
          onClick={() => setActiveTab("text")}
          className={`relative py-2.5 px-3 uppercase font-bold text-center transition-colors ${
            activeTab === "text" ? "bg-white text-black" : "text-[#777777] hover:text-black"
          }`}
        >
          <span>TEXT CONTROLS</span>
          {activeTab === "text" && (
            <motion.div
              layoutId="editor-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("stamps")}
          className={`relative py-2.5 px-3 uppercase font-bold text-center transition-colors ${
            activeTab === "stamps" ? "bg-white text-black" : "text-[#777777] hover:text-black"
          }`}
        >
          <span>STAMPS & BADGES</span>
          {activeTab === "stamps" && (
            <motion.div
              layoutId="editor-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      </div>

      {/* Tab Content with smooth fade */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="p-5 space-y-4"
      >
        {activeTab === "text" ? (
          selectedLayer && selectedLayer.type === "text" ? (
            <div className="space-y-4">
              {/* Text Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#777777] uppercase font-bold">
                  <span>TEXT CONTENT</span>
                  <button
                    onClick={() =>
                      onUpdateLayer(selectedLayer.id, {
                        isUppercase: !selectedLayer.isUppercase,
                      })
                    }
                    className={`px-1.5 py-0.5 border border-black text-[9px] ${
                      selectedLayer.isUppercase ? "bg-black text-white" : "bg-[#FAF9F5] text-black"
                    }`}
                  >
                    CAPS
                  </button>
                </div>
                <textarea
                  value={selectedLayer.text || ""}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { text: e.target.value })
                  }
                  rows={2}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold text-black focus:outline-none focus:bg-white uppercase tracking-wide"
                />
              </div>

              {/* Font Family */}
              <div className="space-y-1">
                <span className="block text-[10px] text-[#777777] uppercase font-bold">FONT</span>
                <select
                  value={selectedLayer.fontFamily || "Impact"}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { fontFamily: e.target.value })
                  }
                  className="w-full p-2 bg-[#FAF9F5] border border-black font-mono-code text-xs text-black uppercase focus:outline-none cursor-pointer"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size & Outline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                    <span>SIZE</span>
                    <span className="text-black">{selectedLayer.fontSize}PX</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="96"
                    value={selectedLayer.fontSize || 42}
                    onChange={(e) =>
                      onUpdateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })
                    }
                    className="w-full accent-black cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                    <span>OUTLINE</span>
                    <span className="text-black">{selectedLayer.strokeWidth}PX</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    value={selectedLayer.strokeWidth || 6}
                    onChange={(e) =>
                      onUpdateLayer(selectedLayer.id, { strokeWidth: Number(e.target.value) })
                    }
                    className="w-full accent-black cursor-pointer"
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="block text-[10px] text-[#777777] uppercase font-bold">COLOR</span>
                  <div className="flex items-center gap-1.5">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => onUpdateLayer(selectedLayer.id, { color: c.value })}
                        className={`w-5 h-5 border ${
                          selectedLayer.color === c.value ? "border-[#E11D48] ring-2 ring-black" : "border-black/30"
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] text-[#777777] uppercase font-bold">OUTLINE</span>
                  <div className="flex items-center gap-1.5">
                    {COLOR_PRESETS.slice(0, 4).map((c) => (
                      <button
                        key={c.value}
                        onClick={() => onUpdateLayer(selectedLayer.id, { strokeColor: c.value })}
                        className={`w-5 h-5 border ${
                          selectedLayer.strokeColor === c.value ? "border-[#E11D48] ring-2 ring-black" : "border-black/30"
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Alignment */}
              <div className="grid grid-cols-3 border border-black divide-x divide-black bg-[#FAF9F5]">
                <button
                  onClick={() => onUpdateLayer(selectedLayer.id, { align: "left" })}
                  className={`p-1.5 flex items-center justify-center ${
                    selectedLayer.align === "left" ? "bg-black text-white" : "hover:bg-[#E6E4DC]"
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateLayer(selectedLayer.id, { align: "center" })}
                  className={`p-1.5 flex items-center justify-center ${
                    selectedLayer.align === "center" ? "bg-black text-white" : "hover:bg-[#E6E4DC]"
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateLayer(selectedLayer.id, { align: "right" })}
                  className={`p-1.5 flex items-center justify-center ${
                    selectedLayer.align === "right" ? "bg-black text-white" : "hover:bg-[#E6E4DC]"
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-center py-2">
              <span className="block text-[#777777] text-[11px]">SELECT OR ADD A TEXT LAYER</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAddTextLayer("TOP TEXT", 15)}
                  className="p-2 bg-black text-white hover:bg-[#333333] font-bold text-[11px] uppercase transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                >
                  + TOP TEXT
                </button>
                <button
                  onClick={() => onAddTextLayer("BOTTOM TEXT", 85)}
                  className="p-2 bg-white border border-black hover:bg-[#F6F5EE] text-black font-bold text-[11px] uppercase transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                >
                  + BOTTOM TEXT
                </button>
              </div>
            </div>
          )
        ) : (
          /* Stamps Tab */
          <div className="space-y-3">
            <span className="block text-[10px] text-[#777777] uppercase font-bold">
              CLICK TO INSERT STAMP
            </span>
            <div className="grid grid-cols-2 gap-2">
              {STAMPS.map((stamp) => (
                <button
                  key={stamp}
                  onClick={() => onAddSticker(stamp)}
                  className="p-2.5 bg-[#FAF9F5] border border-black hover:bg-black hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider text-center hover:translate-y-[-1px] active:translate-y-[1px]"
                >
                  +{stamp}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
