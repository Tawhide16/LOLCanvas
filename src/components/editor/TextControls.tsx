"use client";

import React, { useState } from "react";
import { CanvasLayer } from "@/types";
import { AlignLeft, AlignCenter, AlignRight, Type, Stamp, Sparkles, Pipette, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { GOOGLE_FONTS_CATALOG, loadGoogleFont } from "@/lib/googleFonts";

interface TextControlsProps {
  selectedLayer: CanvasLayer | null;
  onUpdateLayer: (id: string, updates: Partial<CanvasLayer>) => void;
  onAddTextLayer: (initialText?: string, yPos?: number) => void;
  onAddSticker: (symbol: string) => void;
}

const COLOR_PRESETS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Black", value: "#000000" },
  { label: "Crimson", value: "#E11D48" },
  { label: "Yellow", value: "#FACC15" },
  { label: "Cyan", value: "#06B6D4" },
  { label: "Green", value: "#10B981" },
  { label: "Orange", value: "#F97316" },
  { label: "Purple", value: "#A855F7" },
];

const STAMPS = ["VERIFIED", "CERTIFIED", "CONFIDENTIAL", "VIRAL", "BASED"];

export default function TextControls({
  selectedLayer,
  onUpdateLayer,
  onAddTextLayer,
  onAddSticker,
}: TextControlsProps) {
  const [activeTab, setActiveTab] = useState<"text" | "stamps">("text");
  const [customFontInput, setCustomFontInput] = useState("");
  const [fontSearch, setFontSearch] = useState("");
  const [showAllFonts, setShowAllFonts] = useState(false);

  // Group fonts by category
  const filteredFonts = GOOGLE_FONTS_CATALOG.filter((f) =>
    f.name.toLowerCase().includes(fontSearch.toLowerCase())
  );

  const handleSelectFont = (fontName: string) => {
    if (!selectedLayer) return;
    loadGoogleFont(fontName);
    onUpdateLayer(selectedLayer.id, { fontFamily: fontName });
  };

  const handleAddCustomGoogleFont = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFontInput.trim() || !selectedLayer) return;
    const fontName = customFontInput.trim();
    loadGoogleFont(fontName);
    onUpdateLayer(selectedLayer.id, { fontFamily: fontName });
    setCustomFontInput("");
  };

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

              {/* Comprehensive Google Fonts Library */}
              <div className="space-y-1.5 border border-black p-2.5 bg-[#FAF9F5]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-black font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E11D48]" />
                    GOOGLE FONTS ({GOOGLE_FONTS_CATALOG.length}+)
                  </span>
                  <span className="text-[9px] font-bold text-[#777777] uppercase truncate max-w-[120px]">
                    ACTIVE: {selectedLayer.fontFamily || "Impact"}
                  </span>
                </div>

                {/* Main Font Select Dropdown */}
                <select
                  value={selectedLayer.fontFamily || "Impact"}
                  onChange={(e) => handleSelectFont(e.target.value)}
                  className="w-full p-2 bg-white border border-black font-mono-code text-xs text-black uppercase focus:outline-none cursor-pointer"
                >
                  <optgroup label="Meme & Headline Classics">
                    {GOOGLE_FONTS_CATALOG.filter((f) => f.category === "Meme Bold").map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Clean Modern Sans">
                    {GOOGLE_FONTS_CATALOG.filter((f) => f.category === "Clean Sans").map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Monospace & Retro Gaming">
                    {GOOGLE_FONTS_CATALOG.filter((f) => f.category === "Monospace & Retro").map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Display, Comic & Fun">
                    {GOOGLE_FONTS_CATALOG.filter((f) => f.category === "Display & Fun").map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Handwriting & Marker">
                    {GOOGLE_FONTS_CATALOG.filter((f) => f.category === "Handwriting & Marker").map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Vintage & Serif">
                    {GOOGLE_FONTS_CATALOG.filter((f) => f.category === "Vintage & Serif").map((f) => (
                      <option key={f.name} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </optgroup>
                  {/* If custom font is applied not in list */}
                  {selectedLayer.fontFamily &&
                    !GOOGLE_FONTS_CATALOG.some((f) => f.name === selectedLayer.fontFamily) && (
                      <option value={selectedLayer.fontFamily}>
                        {selectedLayer.fontFamily} (Custom)
                      </option>
                    )}
                </select>

                {/* Add ANY Custom Google Font input */}
                <form onSubmit={handleAddCustomGoogleFont} className="flex gap-1 pt-1">
                  <input
                    type="text"
                    value={customFontInput}
                    onChange={(e) => setCustomFontInput(e.target.value)}
                    placeholder="ENTER ANY GOOGLE FONT NAME..."
                    className="flex-1 px-2 py-1 bg-white border border-black/40 text-[10px] uppercase font-bold focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    disabled={!customFontInput.trim()}
                    className="px-2.5 py-1 bg-black text-white hover:bg-[#333333] text-[10px] font-bold uppercase transition-colors disabled:opacity-40"
                    title="Load any Google font on demand"
                  >
                    + LOAD
                  </button>
                </form>
              </div>

              {/* Size & Outline Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#777777] uppercase font-bold">
                    <span>SIZE</span>
                    <span className="text-black">{selectedLayer.fontSize}PX</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="120"
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
                    max="20"
                    value={selectedLayer.strokeWidth || 6}
                    onChange={(e) =>
                      onUpdateLayer(selectedLayer.id, { strokeWidth: Number(e.target.value) })
                    }
                    className="w-full accent-black cursor-pointer"
                  />
                </div>
              </div>

              {/* ============================================================== */}
              {/* ADVANCED COLOR PICKER & COLOR CODE INPUTS                      */}
              {/* ============================================================== */}
              <div className="space-y-3 border-t border-black/15 pt-3">
                {/* 1. TEXT COLOR WITH COLOR PICKER & COLOR CODE */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-black uppercase font-bold flex items-center gap-1">
                      <Pipette className="w-3 h-3 text-[#E11D48]" />
                      TEXT COLOR
                    </span>
                    {/* Hex Code Input */}
                    <div className="flex items-center border border-black bg-white px-1.5 py-0.5">
                      <span className="text-[10px] text-[#777777] font-bold mr-0.5">#</span>
                      <input
                        type="text"
                        maxLength={6}
                        value={(selectedLayer.color || "#FFFFFF").replace("#", "")}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "");
                          onUpdateLayer(selectedLayer.id, { color: `#${val}` });
                        }}
                        placeholder="FFFFFF"
                        className="w-16 font-mono-code text-[11px] font-bold uppercase focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Swatches + Native Visual Color Picker */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Visual Color Picker Box */}
                    <label
                      className="relative w-6 h-6 border-2 border-black cursor-pointer overflow-hidden shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform"
                      title="Open Visual Color Picker"
                      style={{ backgroundColor: selectedLayer.color || "#FFFFFF" }}
                    >
                      <input
                        type="color"
                        value={selectedLayer.color || "#FFFFFF"}
                        onChange={(e) => onUpdateLayer(selectedLayer.id, { color: e.target.value })}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>

                    {/* Presets */}
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => onUpdateLayer(selectedLayer.id, { color: c.value })}
                        className={`w-5 h-5 border transition-all ${
                          selectedLayer.color?.toUpperCase() === c.value.toUpperCase()
                            ? "border-[#E11D48] ring-2 ring-black scale-110"
                            : "border-black/30 hover:border-black"
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. OUTLINE COLOR WITH COLOR PICKER & COLOR CODE */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-black uppercase font-bold flex items-center gap-1">
                      <Pipette className="w-3 h-3 text-[#777777]" />
                      OUTLINE COLOR
                    </span>
                    {/* Hex Code Input */}
                    <div className="flex items-center border border-black bg-white px-1.5 py-0.5">
                      <span className="text-[10px] text-[#777777] font-bold mr-0.5">#</span>
                      <input
                        type="text"
                        maxLength={6}
                        value={(selectedLayer.strokeColor || "#000000").replace("#", "")}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "");
                          onUpdateLayer(selectedLayer.id, { strokeColor: `#${val}` });
                        }}
                        placeholder="000000"
                        className="w-16 font-mono-code text-[11px] font-bold uppercase focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Swatches + Native Visual Color Picker */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Visual Color Picker Box */}
                    <label
                      className="relative w-6 h-6 border-2 border-black cursor-pointer overflow-hidden shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform"
                      title="Open Visual Color Picker"
                      style={{ backgroundColor: selectedLayer.strokeColor || "#000000" }}
                    >
                      <input
                        type="color"
                        value={selectedLayer.strokeColor || "#000000"}
                        onChange={(e) =>
                          onUpdateLayer(selectedLayer.id, { strokeColor: e.target.value })
                        }
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </label>

                    {/* Presets */}
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => onUpdateLayer(selectedLayer.id, { strokeColor: c.value })}
                        className={`w-5 h-5 border transition-all ${
                          selectedLayer.strokeColor?.toUpperCase() === c.value.toUpperCase()
                            ? "border-[#E11D48] ring-2 ring-black scale-110"
                            : "border-black/30 hover:border-black"
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Alignment Controls */}
              <div className="grid grid-cols-3 border border-black divide-x divide-black bg-[#FAF9F5] mt-2">
                <button
                  type="button"
                  onClick={() => onUpdateLayer(selectedLayer.id, { align: "left" })}
                  className={`p-2 flex items-center justify-center transition-colors ${
                    selectedLayer.align === "left" ? "bg-black text-white" : "hover:bg-[#E6E4DC]"
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateLayer(selectedLayer.id, { align: "center" })}
                  className={`p-2 flex items-center justify-center transition-colors ${
                    selectedLayer.align === "center" ? "bg-black text-white" : "hover:bg-[#E6E4DC]"
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateLayer(selectedLayer.id, { align: "right" })}
                  className={`p-2 flex items-center justify-center transition-colors ${
                    selectedLayer.align === "right" ? "bg-black text-white" : "hover:bg-[#E6E4DC]"
                  }`}
                  title="Align Right"
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
