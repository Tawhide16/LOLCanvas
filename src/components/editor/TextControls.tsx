"use client";

import React, { useState } from "react";
import { CanvasLayer } from "@/types";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Type,
  Stamp,
  Sparkles,
  Pipette,
  Plus,
  Search,
  Sliders,
  Layers,
  ChevronDown,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { GOOGLE_FONTS_CATALOG, loadGoogleFont, FontCategory } from "@/lib/googleFonts";
import { fabricAdapter } from "@/lib/editor/fabricAdapter";
import { useEditorStore } from "@/lib/editor/editorStore";

interface TextControlsProps {
  selectedLayer: CanvasLayer | null;
  onUpdateLayer?: (id: string, updates: Partial<CanvasLayer>) => void;
  onAddTextLayer?: (initialText?: string, yPos?: number) => void;
  onAddSticker?: (symbol: string) => void;
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

const STAMPS = ["VERIFIED", "CERTIFIED", "CONFIDENTIAL", "VIRAL", "BASED", "TOP TIER", "100% REAL", "APPROVED"];

const FONT_CATEGORIES: FontCategory[] = [
  "All",
  "Bangla",
  "Meme Bold",
  "Clean Sans",
  "Display & Fun",
  "Monospace & Retro",
  "Handwriting & Marker",
  "Vintage & Serif",
];

export default function TextControls({
  selectedLayer,
  onUpdateLayer,
  onAddTextLayer,
  onAddSticker,
}: TextControlsProps) {
  const [activeTab, setActiveTab] = useState<"text" | "stamps">("text");
  const [fontSearch, setFontSearch] = useState("");
  const [selectedFontCategory, setSelectedFontCategory] = useState<FontCategory>("All");
  const [showAllFonts, setShowAllFonts] = useState(false);

  // Active object props from Zustand store
  const activeProps = useEditorStore((s) => s.activeObjectProps);

  const currentText = activeProps?.text ?? selectedLayer?.text ?? "";
  const currentFont = activeProps?.fontFamily ?? selectedLayer?.fontFamily ?? "Impact";
  const currentSize = activeProps?.fontSize ?? selectedLayer?.fontSize ?? 44;
  const currentFill = activeProps?.fill ?? selectedLayer?.color ?? "#FFFFFF";
  const currentStroke = activeProps?.stroke ?? selectedLayer?.strokeColor ?? "#000000";
  const currentStrokeWidth = activeProps?.strokeWidth ?? selectedLayer?.strokeWidth ?? 4;
  const currentAlign = activeProps?.textAlign ?? selectedLayer?.align ?? "center";
  const isBold = activeProps?.isBold ?? false;
  const isItalic = activeProps?.isItalic ?? false;
  const isUnderline = activeProps?.isUnderline ?? false;
  const currentLineHeight = activeProps?.lineHeight ?? 1.16;
  const currentCharSpacing = activeProps?.charSpacing ?? 0;

  // Filter fonts
  const filteredFonts = GOOGLE_FONTS_CATALOG.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(fontSearch.toLowerCase());
    const matchesCategory =
      selectedFontCategory === "All" || f.category === selectedFontCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpdate = (updates: Record<string, any>) => {
    fabricAdapter.updateActiveObject(updates);
    if (selectedLayer && onUpdateLayer) {
      onUpdateLayer(selectedLayer.id, updates);
    }
  };

  const handleSelectFont = (fontName: string) => {
    loadGoogleFont(fontName);
    handleUpdate({ fontFamily: fontName });
  };

  const handleAddText = () => {
    if (onAddTextLayer) {
      onAddTextLayer("NEW CAPTION");
    } else {
      fabricAdapter.addTextLayer("NEW CAPTION");
    }
  };

  const handleAddBanglaText = (fontName = "Hind Siliguri") => {
    loadGoogleFont(fontName);
    fabricAdapter.addTextLayer("আপনার মেমে ক্যাপশন", {
      fontFamily: fontName,
      fill: "#FFFFFF",
      stroke: "#000000",
      strokeWidth: 4,
    });
  };

  return (
    <div className="bg-white border-b border-black font-mono-code text-xs select-none">
      {/* Animated Tab Bar */}
      <div className="grid grid-cols-2 border-b border-black divide-x divide-black bg-[#FAF9F5]">
        <button
          type="button"
          onClick={() => setActiveTab("text")}
          className={`relative py-2.5 px-3 uppercase font-bold text-center transition-colors ${
            activeTab === "text" ? "bg-white text-black" : "text-[#777777] hover:text-black"
          }`}
        >
          <span>TEXT & TYPOGRAPHY</span>
          {activeTab === "text" && (
            <motion.div
              layoutId="editor-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>

        <button
          type="button"
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

      {/* Tab Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
        {activeTab === "text" ? (
          <>
            {/* Quick Add Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddText}
                className="py-2 px-3 bg-black text-white hover:bg-[#333333] transition-colors font-bold uppercase text-[11px] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD CAPTION</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddBanglaText("Hind Siliguri")}
                className="py-2 px-3 bg-[#E11D48] text-white hover:bg-black transition-colors font-bold uppercase text-[11px] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                title="Add Bangla Caption (Hind Siliguri)"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>+ বাংলা ক্যাপশন</span>
              </button>
            </div>

            {/* In-canvas editing hint */}
            <div className="p-2.5 bg-[#FAF9F5] border border-black/20 text-[10px] text-[#666666] flex items-center justify-between">
              <span>PRO-TIP: Double-click text on canvas to type directly!</span>
              <span className="font-bold text-black border border-black/40 px-1 bg-white">2× CLICK</span>
            </div>

            {/* Text Value Editor */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#777777] uppercase flex items-center justify-between">
                <span>TEXT CONTENT</span>
                <span className="text-[9px] text-[#999999]">{currentText.length} CHARS</span>
              </label>
              <textarea
                value={currentText}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                rows={2}
                placeholder="TYPE MEME TEXT..."
                className="w-full bg-[#FAF9F5] border border-black p-2 font-display text-sm font-bold text-black focus:outline-none focus:bg-white uppercase tracking-wider"
              />
            </div>

            {/* Formatting & Alignment Toolbar */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#777777] uppercase">
                STYLE & ALIGNMENT
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF9F5] border border-black">
                {/* Bold */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ fontWeight: isBold ? "normal" : "bold" })}
                  className={`p-1.5 border border-black transition-colors ${
                    isBold ? "bg-black text-white" : "bg-white text-black hover:bg-[#F6F5EE]"
                  }`}
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>

                {/* Italic */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ fontStyle: isItalic ? "normal" : "italic" })}
                  className={`p-1.5 border border-black transition-colors ${
                    isItalic ? "bg-black text-white" : "bg-white text-black hover:bg-[#F6F5EE]"
                  }`}
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>

                {/* Underline */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ underline: !isUnderline })}
                  className={`p-1.5 border border-black transition-colors ${
                    isUnderline ? "bg-black text-white" : "bg-white text-black hover:bg-[#F6F5EE]"
                  }`}
                  title="Underline"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                {/* Uppercase */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ text: currentText.toUpperCase() })}
                  className="px-2 py-1.5 bg-white border border-black hover:bg-[#F6F5EE] text-black font-bold text-[10px]"
                  title="Convert to Uppercase"
                >
                  TT
                </button>

                <div className="h-5 w-px bg-black/20 mx-1" />

                {/* Align Left */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ textAlign: "left" })}
                  className={`p-1.5 border border-black transition-colors ${
                    currentAlign === "left" ? "bg-black text-white" : "bg-white text-black hover:bg-[#F6F5EE]"
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>

                {/* Align Center */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ textAlign: "center" })}
                  className={`p-1.5 border border-black transition-colors ${
                    currentAlign === "center" ? "bg-black text-white" : "bg-white text-black hover:bg-[#F6F5EE]"
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>

                {/* Align Right */}
                <button
                  type="button"
                  onClick={() => handleUpdate({ textAlign: "right" })}
                  className={`p-1.5 border border-black transition-colors ${
                    currentAlign === "right" ? "bg-black text-white" : "bg-white text-black hover:bg-[#F6F5EE]"
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Font Size & Spacing */}
            <div className="grid grid-cols-2 gap-3">
              {/* Font Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-[#777777]">
                  <span>SIZE</span>
                  <span>{currentSize}PX</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="140"
                  value={currentSize}
                  onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              {/* Line Height */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-[#777777]">
                  <span>LINE HEIGHT</span>
                  <span>{Number(currentLineHeight).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={currentLineHeight}
                  onChange={(e) => handleUpdate({ lineHeight: Number(e.target.value) })}
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-[#777777]">
                <span>LETTER SPACING</span>
                <span>{currentCharSpacing}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="400"
                step="10"
                value={currentCharSpacing}
                onChange={(e) => handleUpdate({ charSpacing: Number(e.target.value) })}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Text Color & Outline (Classic Meme Outline) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Text Fill */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#777777] uppercase">TEXT COLOR</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentFill}
                    onChange={(e) => handleUpdate({ fill: e.target.value })}
                    className="w-8 h-8 rounded-none border border-black cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={currentFill}
                    onChange={(e) => handleUpdate({ fill: e.target.value })}
                    className="flex-1 bg-[#FAF9F5] border border-black px-2 py-1 uppercase text-[11px] font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Stroke / Outline */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#777777] uppercase">MEME OUTLINE</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentStroke}
                    onChange={(e) => handleUpdate({ stroke: e.target.value })}
                    className="w-8 h-8 rounded-none border border-black cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={currentStrokeWidth}
                    onChange={(e) => handleUpdate({ strokeWidth: Number(e.target.value) })}
                    className="w-16 bg-[#FAF9F5] border border-black px-2 py-1 text-[11px] font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Color Chips */}
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleUpdate({ fill: c.value })}
                  style={{ backgroundColor: c.value }}
                  className="w-6 h-6 border border-black hover:scale-110 transition-transform shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  title={c.label}
                />
              ))}
            </div>

            {/* Drop Shadow Section */}
            <div className="p-3 bg-[#FAF9F5] border border-black space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-black uppercase">
                <span>DROP SHADOW</span>
                <button
                  type="button"
                  onClick={() => handleUpdate({ shadowColor: "#000000", shadowBlur: 8, shadowOffsetX: 3, shadowOffsetY: 3 })}
                  className="text-[9px] px-1.5 py-0.5 bg-black text-white hover:bg-[#E11D48] transition-colors"
                >
                  ADD SHADOW
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdate({ shadowColor: "" })}
                  className="px-2 py-1 bg-white border border-black text-[10px] hover:bg-[#F6F5EE]"
                >
                  NO SHADOW
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate({ shadowColor: "#000000", shadowBlur: 10, shadowOffsetX: 4, shadowOffsetY: 4 })}
                  className="px-2 py-1 bg-white border border-black text-[10px] hover:bg-[#F6F5EE]"
                >
                  BLACK SOFT
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate({ shadowColor: "#E11D48", shadowBlur: 12, shadowOffsetX: 3, shadowOffsetY: 3 })}
                  className="px-2 py-1 bg-white border border-black text-[10px] hover:bg-[#F6F5EE] text-[#E11D48]"
                >
                  CRIMSON GLOW
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* FONT SELECTOR & BANGLA TYPOGRAPHY                             */}
            {/* ============================================================== */}
            <div className="space-y-2 pt-2 border-t border-black">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-black uppercase">
                  ACTIVE FONT: <strong className="text-[#E11D48]">{currentFont}</strong>
                </span>
                <span className="text-[9px] text-[#777777]">{filteredFonts.length} FONTS</span>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1">
                {FONT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFontCategory(cat)}
                    className={`px-2 py-1 text-[10px] font-bold uppercase border border-black transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                      selectedFontCategory === cat
                        ? "bg-black text-white"
                        : cat === "Bangla"
                        ? "bg-[#FFE4E6] text-[#E11D48] hover:bg-[#E11D48] hover:text-white"
                        : "bg-white text-black hover:bg-[#F6F5EE]"
                    }`}
                  >
                    {cat === "Bangla" ? "🇧🇩 BANGLA" : cat}
                  </button>
                ))}
              </div>

              {/* Search Font */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="SEARCH FONT (IMPACT, HIND SILIGURI, MONTSERRAT)..."
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-black pl-8 pr-3 py-1.5 text-xs text-black uppercase focus:outline-none focus:bg-white"
                />
              </div>

              {/* Fonts Grid */}
              <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto p-1 bg-[#FAF9F5] border border-black">
                {filteredFonts.slice(0, showAllFonts ? undefined : 20).map((font) => (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => handleSelectFont(font.name)}
                    className={`p-2 text-left border transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                      currentFont === font.name
                        ? "bg-black text-white border-black"
                        : font.isBangla
                        ? "bg-[#FFF1F2] border-[#E11D48] hover:bg-[#FFE4E6] text-black"
                        : "bg-white border-black/30 hover:border-black hover:bg-[#FAF9F5] text-black"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] truncate">{font.name}</span>
                      {font.isBangla && (
                        <span className="text-[8px] bg-[#E11D48] text-white px-1 py-0.2 font-mono-code">
                          বাংলা
                        </span>
                      )}
                    </div>
                    <span
                      className="text-sm block truncate mt-0.5"
                      style={{ fontFamily: `"${font.name}", sans-serif` }}
                    >
                      {font.isBangla ? "বাংলা মেমে" : "LOLCanvas Meme"}
                    </span>
                  </button>
                ))}
              </div>

              {filteredFonts.length > 20 && (
                <button
                  type="button"
                  onClick={() => setShowAllFonts(!showAllFonts)}
                  className="w-full py-1.5 bg-[#FAF9F5] border border-black hover:bg-black hover:text-white transition-colors text-[10px] font-bold uppercase text-center"
                >
                  {showAllFonts ? "SHOW LESS" : `SHOW ALL (${filteredFonts.length} FONTS)`}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Stamps & Badges Tab */
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-[#777777] uppercase block">
              INSTANT STAMPS & WATERMARKS
            </span>
            <div className="grid grid-cols-2 gap-2">
              {STAMPS.map((stamp) => (
                <button
                  key={stamp}
                  type="button"
                  onClick={() => {
                    if (onAddSticker) {
                      onAddSticker(stamp);
                    } else {
                      fabricAdapter.addTextLayer(`[${stamp}]`, {
                        fontFamily: "Impact",
                        fill: "#E11D48",
                        stroke: "#000000",
                        strokeWidth: 2,
                      });
                    }
                  }}
                  className="p-3 bg-white border border-black hover:bg-[#E11D48] hover:text-white font-display font-extrabold uppercase text-center text-xs tracking-wider transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                >
                  {stamp}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
