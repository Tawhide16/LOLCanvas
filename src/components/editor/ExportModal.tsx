"use client";

import React, { useState } from "react";
import { X, Download, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { useEditorStore } from "@/lib/editor/editorStore";
import { fabricAdapter } from "@/lib/editor/fabricAdapter";

export default function ExportModal() {
  const showExportModal = useEditorStore((s) => s.showExportModal);
  const setShowExportModal = useEditorStore((s) => s.setShowExportModal);
  const width = useEditorStore((s) => s.width);
  const height = useEditorStore((s) => s.height);
  const activePresetName = useEditorStore((s) => s.activePresetName);

  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [scale, setScale] = useState<number>(1);
  const [quality, setQuality] = useState<number>(95);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!showExportModal) return null;

  const exportWidth = Math.round(width * scale);
  const exportHeight = Math.round(height * scale);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const dataUrl = await fabricAdapter.exportImage(format, scale, quality / 100);
      if (!dataUrl) return;

      const ext = format === "jpeg" ? "jpg" : format;
      const cleanName = activePresetName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `lolcanvas-${cleanName}-${exportWidth}x${exportHeight}-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setShowExportModal(false);
    } catch (e) {
      console.error("Export download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const dataUrl = await fabricAdapter.exportImage("png", scale, 1.0);
      if (!dataUrl) return;

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-mono-code text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black px-4 py-3 bg-[#E6E4DC]">
          <div className="flex items-center gap-2 font-bold text-black uppercase">
            <Download className="w-4 h-4 text-[#E11D48]" />
            <span>EXPORT WATERMARK-FREE MEME</span>
          </div>
          <button
            type="button"
            onClick={() => setShowExportModal(false)}
            className="p-1 hover:bg-black hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Format Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#777777] uppercase text-[10px] block">
              FILE FORMAT
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["png", "jpeg", "webp"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 border border-black font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    format === fmt ? "bg-[#E11D48] text-white" : "bg-white text-black hover:bg-[#F6F5EE]"
                  }`}
                >
                  {fmt === "jpeg" ? "JPG" : fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Scale Multiplier */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#777777] uppercase">
              <span>RESOLUTION SCALE</span>
              <span className="text-black font-bold">
                {exportWidth} × {exportHeight} PX
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { scaleVal: 1, label: "1× (Standard)" },
                { scaleVal: 2, label: "2× (Retina HD)" },
                { scaleVal: 3, label: "3× (Ultra 4K)" },
              ].map((s) => (
                <button
                  key={s.scaleVal}
                  type="button"
                  onClick={() => setScale(s.scaleVal)}
                  className={`py-2 px-2 border border-black font-bold uppercase text-[10px] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    scale === s.scaleVal ? "bg-black text-white" : "bg-white text-black hover:bg-[#F6F5EE]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPG & WEBP) */}
          {format !== "png" && (
            <div className="space-y-1 bg-white p-3 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between text-[10px] font-bold text-[#777777]">
                <span>QUALITY COMPRESSION</span>
                <span className="text-black font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[#E11D48] cursor-pointer"
              />
            </div>
          )}

          {/* 100% Watermark Free Guarantee Badge */}
          <div className="p-2.5 bg-[#DCFCE7] border border-[#16A34A] text-[#15803D] flex items-center gap-2 font-bold text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% FREE • ZERO WATERMARK • ORIGINAL QUALITY</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 bg-white border border-black hover:bg-[#F6F5EE] text-black font-bold uppercase flex items-center justify-center gap-1.5 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[#10B981]">COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY CLIPBOARD</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="py-2.5 px-3 bg-black hover:bg-[#E11D48] text-white font-bold uppercase flex items-center justify-center gap-1.5 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? "EXPORTING..." : "DOWNLOAD NOW"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
