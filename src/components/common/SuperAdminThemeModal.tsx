"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  UploadCloud,
  Crown,
  RotateCcw,
  Check,
  Sparkles,
  Loader2,
  Palette,
  Edit3,
  Globe,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { processImageForWeb } from "@/lib/imageOptimizer";
import { useAdminEditMode } from "@/lib/useAdminEditMode";

interface SuperAdminThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl: string;
  currentLogoText: string;
  currentLogoTag: string;
  adminEmail: string | null;
  onLogoUpdated: (newLogo: { logoUrl: string; logoText: string; logoTag: string }) => void;
}

const THEME_ACCENTS = [
  { name: "CRIMSON (DEFAULT)", hex: "#E11D48" },
  { name: "ELECTRIC BLUE", hex: "#2563EB" },
  { name: "EMERALD GREEN", hex: "#059669" },
  { name: "CYBER VIOLET", hex: "#9333EA" },
  { name: "SUNSET AMBER", hex: "#D97706" },
  { name: "JET NOIR", hex: "#000000" },
];

export default function SuperAdminThemeModal({
  isOpen,
  onClose,
  currentLogoUrl,
  currentLogoText,
  currentLogoTag,
  adminEmail,
  onLogoUpdated,
}: SuperAdminThemeModalProps) {
  const { isEditMode, setEditMode, themeAccent, setThemeAccent } = useAdminEditMode();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"theme" | "inline">("theme");
  const [logoText, setLogoText] = useState(currentLogoText || "LOLCANVAS");
  const [logoTag, setLogoTag] = useState(currentLogoTag || "®");
  const [logoPreview, setLogoPreview] = useState(currentLogoUrl || "/logo-icon.png");
  const [selectedAccent, setSelectedAccent] = useState(themeAccent || "#E11D48");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLogoText(currentLogoText || "LOLCANVAS");
    setLogoTag(currentLogoTag || "®");
    setLogoPreview(currentLogoUrl || "/logo-icon.png");
    setSelectedAccent(themeAccent || "#E11D48");
  }, [currentLogoText, currentLogoTag, currentLogoUrl, themeAccent, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, SVG, WebP)");
      return;
    }
    setIsProcessingImage(true);
    try {
      const optimized = await processImageForWeb(file, 256, 0.95);
      setLogoPreview(optimized.previewDataUri);
    } catch (e) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleResetToDefault = () => {
    setLogoText("LOLCANVAS");
    setLogoTag("®");
    setLogoPreview("/logo-icon.png");
    setSelectedAccent("#E11D48");
    setThemeAccent("#E11D48");
    setStatusMessage("Reset to original Swiss default styling.");
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const newConfig = {
      logoUrl: logoPreview || "/logo-icon.png",
      logoText: (logoText.trim() || "LOLCANVAS").toUpperCase(),
      logoTag: logoTag.trim(),
    };

    try {
      // 1. Update theme accent
      setThemeAccent(selectedAccent);

      // 2. Immediately store logo config in localStorage
      try {
        localStorage.setItem("lolcanvas_custom_logo", JSON.stringify(newConfig));
        window.dispatchEvent(
          new CustomEvent("lolcanvas_logo_changed", { detail: newConfig })
        );
      } catch (e) {}

      // 3. Persist to backend API
      await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newConfig,
          themeAccent: selectedAccent,
          adminEmail: adminEmail || "admin123@gmail.com",
        }),
      });

      onLogoUpdated(newConfig);
      setStatusMessage("✓ Theme and branding published live!");
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Save theme error:", err);
      onLogoUpdated(newConfig);
      setIsSaving(false);
      onClose();
    }
  };

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black px-4 sm:px-5 py-3 bg-[#E6E4DC] font-mono-code text-xs select-none">
          <div className="flex items-center gap-2 font-bold uppercase text-black">
            <Crown className="w-4 h-4 text-[#E11D48]" />
            <span>SUPER ADMIN // EDIT WEBSITE & THEME</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1 hover:bg-black hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 border-b border-black font-mono-code text-xs font-bold divide-x divide-black select-none">
          <button
            type="button"
            onClick={() => setActiveTab("theme")}
            className={`py-2.5 px-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === "theme"
                ? "bg-white text-black border-b-2 border-black"
                : "bg-[#FAF9F5] hover:bg-[#F6F5EE] text-[#666666]"
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>THEME & BRANDING</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inline")}
            className={`py-2.5 px-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === "inline"
                ? "bg-white text-black border-b-2 border-black"
                : "bg-[#FAF9F5] hover:bg-[#F6F5EE] text-[#666666]"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>INLINE EDIT MODE</span>
            {isEditMode && (
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            )}
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="p-3.5 bg-white border-b border-black select-none space-y-1.5">
          <div className="flex items-center justify-between font-mono-code text-[10px] text-[#777777] uppercase font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#E11D48]" />
              LIVE NAVBAR HEADER PREVIEW
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 border font-bold text-white uppercase"
              style={{ backgroundColor: selectedAccent, borderColor: selectedAccent }}
            >
              ACCENT ACTIVE
            </span>
          </div>

          <div className="p-3 bg-[#FAF9F5] border border-black flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-8 h-8 object-contain border border-black/20 bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-black uppercase">
                {logoText || "LOLCANVAS"}
                {logoTag && (
                  <span className="text-[11px] align-super font-mono-code font-normal ml-0.5">
                    {logoTag}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono-code text-[10px]">
              <span className="bg-black text-white px-2 py-1 font-bold">
                PREVIEW
              </span>
            </div>
          </div>
        </div>

        {/* Tab 1: Theme & Branding Form */}
        {activeTab === "theme" && (
          <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 font-mono-code text-xs overflow-y-auto max-h-[60vh]">
            {/* File Upload Section */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#777777] uppercase font-bold flex items-center justify-between">
                <span>CHANGE LOGO ICON / IMAGE</span>
                <span className="text-[9px] text-[#555555]">PNG, SVG, WEBP, JPG</span>
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-black/40 hover:border-black p-3.5 text-center bg-white hover:bg-[#F6F5EE] transition-colors cursor-pointer flex items-center justify-center gap-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />

                {isProcessingImage ? (
                  <div className="flex items-center gap-2 text-black">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E11D48]" />
                    <span>OPTIMIZING LOGO ICON...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-[#E11D48]" />
                    <span className="font-bold uppercase text-[11px] text-black">
                      CLICK OR DRAG IMAGE TO REPLACE LOGO
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Brand Names */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  BRAND NAME *
                </label>
                <input
                  type="text"
                  required
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  placeholder="LOLCANVAS"
                  className="w-full p-2 bg-white border border-black uppercase text-xs font-bold text-black focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  TAG / BADGE
                </label>
                <input
                  type="text"
                  value={logoTag}
                  onChange={(e) => setLogoTag(e.target.value)}
                  placeholder="®"
                  className="w-full p-2 bg-white border border-black uppercase text-xs font-bold text-black focus:outline-none focus:border-[#E11D48]"
                />
              </div>
            </div>

            {/* Color Accent Palette */}
            <div className="space-y-2 pt-2 border-t border-black/20">
              <label className="text-[10px] text-[#777777] uppercase font-bold block">
                PRIMARY THEME ACCENT COLOR
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEME_ACCENTS.map((item) => (
                  <button
                    key={item.hex}
                    type="button"
                    onClick={() => setSelectedAccent(item.hex)}
                    className={`p-2 border text-left flex items-center justify-between transition-all ${
                      selectedAccent === item.hex
                        ? "border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "border-black/30 bg-[#FAF9F5] hover:border-black"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 border border-black shrink-0"
                        style={{ backgroundColor: item.hex }}
                      />
                      <span className="text-[10px] font-bold uppercase truncate">
                        {item.name}
                      </span>
                    </div>
                    {selectedAccent === item.hex && (
                      <Check className="w-3.5 h-3.5 text-black shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {statusMessage && (
              <div className="p-2.5 bg-[#DCFCE7] border border-[#16A34A] text-[#15803D] text-[11px] font-bold uppercase">
                {statusMessage}
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-black pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={isSaving}
                className="px-3 py-2 bg-white border border-black hover:bg-[#E6E4DC] text-black uppercase font-bold text-[11px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3 h-3 text-[#777777]" />
                <span>RESET DEFAULT</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-3.5 py-2 bg-white border border-black hover:bg-[#E6E4DC] text-black uppercase font-bold text-[11px] transition-colors disabled:opacity-50"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isSaving || !logoText.trim()}
                  className="px-5 py-2 bg-black text-white hover:bg-[#222222] uppercase font-bold text-[11px] transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                      <span>APPLY THEME ■</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Inline Edit Mode Switch */}
        {activeTab === "inline" && (
          <div className="p-5 space-y-4 font-mono-code text-xs">
            <div className="p-4 bg-white border-2 border-black space-y-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-black uppercase flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#E11D48]" />
                    <span>INLINE EDIT MODE (LIVE WEBSITE)</span>
                  </h4>
                  <p className="text-[11px] text-[#555555] mt-0.5">
                    Click to activate or deactivate on-hover editing across all website sections.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditMode(!isEditMode)}
                  className={`px-4 py-2 font-bold uppercase text-xs flex items-center gap-2 border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] ${
                    isEditMode
                      ? "bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]"
                      : "bg-[#FFE4E6] text-[#E11D48] hover:bg-[#FECDD3]"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isEditMode ? "bg-[#15803D]" : "bg-[#E11D48]"}`} />
                  <span>{isEditMode ? "EDIT MODE: ON" : "EDIT MODE: OFF"}</span>
                </button>
              </div>

              <div className="p-3 bg-[#FAF9F5] border border-black/20 text-[11px] leading-relaxed text-[#333333]">
                {isEditMode ? (
                  <span className="text-[#15803D] font-bold block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>EDIT MODE IS ACTIVE! You can now hover and click any text, slogan, manifesto, or header on the website to edit it live.</span>
                  </span>
                ) : (
                  <span className="text-[#666666] block">
                    Edit mode is currently OFF. The website is in normal viewing mode. Turn it ON above to enable live in-place content editing.
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F5] border border-black space-y-2">
              <span className="text-[10px] font-bold text-[#777777] uppercase block">
                WHAT YOU CAN EDIT WITH INLINE EDIT MODE:
              </span>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-[#444444]">
                <li>Hero Headline & Subtitles</li>
                <li>Studio Manifesto & Manifestos</li>
                <li>Archive Title & Descriptions</li>
                <li>Top Outer Header Notices</li>
                <li>Footer Texts & Copyright</li>
                <li>Contact Page Headlines & Help Texts</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-black/20">
              <span className="text-[10px] text-[#777777] uppercase">
                CHANGES ARE SAVED DIRECTLY TO POSTGRESQL & LOCAL STORAGE
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-black text-white hover:bg-[#222222] font-bold uppercase text-xs"
              >
                DONE / RETURN TO WEBSITE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
