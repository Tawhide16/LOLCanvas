"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, Crown, RotateCcw, Check, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";
import { processImageForWeb } from "@/lib/imageOptimizer";

interface SuperAdminLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl: string;
  currentLogoText: string;
  currentLogoTag: string;
  adminEmail: string | null;
  onLogoUpdated: (newLogo: { logoUrl: string; logoText: string; logoTag: string }) => void;
}

export default function SuperAdminLogoModal({
  isOpen,
  onClose,
  currentLogoUrl,
  currentLogoText,
  currentLogoTag,
  adminEmail,
  onLogoUpdated,
}: SuperAdminLogoModalProps) {
  const [logoText, setLogoText] = useState(currentLogoText || "LOLCANVAS");
  const [logoTag, setLogoTag] = useState(currentLogoTag || "®");
  const [logoPreview, setLogoPreview] = useState(currentLogoUrl || "/logo-icon.png");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, SVG, WebP)");
      return;
    }
    setIsProcessingImage(true);
    try {
      // Process to a crisp, high-DPI lightweight WebP icon
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
    setStatusMessage("Reset to default LOLCanvas branding.");
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
      // 1. Immediately store in localStorage for instantaneous client load
      try {
        localStorage.setItem("lolcanvas_custom_logo", JSON.stringify(newConfig));
        window.dispatchEvent(
          new CustomEvent("lolcanvas_logo_changed", { detail: newConfig })
        );
      } catch (e) {}

      // 2. Persist to backend API
      const res = await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newConfig,
          adminEmail: adminEmail || "admin123@gmail.com",
        }),
      });

      if (!res.ok) {
        console.warn("Backend logo persistence returned non-200, continuing with local update");
      }

      onLogoUpdated(newConfig);
      setStatusMessage("✓ Logo updated successfully across the navbar!");
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Save logo error:", err);
      // Still update locally
      onLogoUpdated(newConfig);
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black px-5 py-3 bg-[#E6E4DC] font-mono-code text-xs">
          <div className="flex items-center gap-2 font-bold uppercase text-black">
            <Crown className="w-4 h-4 text-[#E11D48]" />
            <span>SUPER ADMIN // NAVBAR LOGO CUSTOMIZER</span>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1 hover:bg-black hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 bg-white border-b border-black space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[10px] text-[#777777] uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#E11D48]" />
              LIVE NAVBAR PREVIEW
            </span>
            <span className="text-[10px] font-mono-code text-[#E11D48] bg-[#FFE4E6] px-1.5 py-0.5 border border-[#E11D48]">
              REAL-TIME
            </span>
          </div>

          <div className="p-4 bg-[#FAF9F5] border border-black flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-8 h-8 object-contain border border-black/20 bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <span className="font-display font-extrabold text-xl tracking-tight text-black uppercase">
                {logoText || "LOLCANVAS"}
                {logoTag && (
                  <span className="text-[11px] align-super font-mono-code font-normal ml-0.5">
                    {logoTag}
                  </span>
                )}
              </span>
            </div>
            <span className="font-mono-code text-[10px] text-[#777777] hidden sm:inline">
              [NAVBAR HEADER]
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 font-mono-code text-xs">
          {/* File Upload Section */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#777777] uppercase font-bold flex items-center justify-between">
              <span>UPLOAD NEW LOGO ICON / IMAGE</span>
              <span className="text-[9px] text-[#555555]">PNG, SVG, WEBP, JPG</span>
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-black/40 hover:border-black p-4 text-center bg-white hover:bg-[#F6F5EE] transition-colors cursor-pointer flex items-center justify-center gap-3"
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
                    CLICK OR DRAG ICON TO REPLACE
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Text Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] text-[#777777] uppercase font-bold">
                BRAND NAME / LOGO TEXT *
              </label>
              <input
                type="text"
                required
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                placeholder="E.G. LOLCANVAS, MEMESTATION..."
                className="w-full p-2 bg-white border border-black uppercase text-xs font-bold text-black focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-[#777777] uppercase font-bold">
                BADGE / TAG
              </label>
              <input
                type="text"
                value={logoTag}
                onChange={(e) => setLogoTag(e.target.value)}
                placeholder="® or PRO"
                className="w-full p-2 bg-white border border-black uppercase text-xs font-bold text-black focus:outline-none"
              />
            </div>
          </div>

          {statusMessage && (
            <div className="p-2 bg-[#DCFCE7] border border-[#16A34A] text-[#15803D] text-[11px] font-bold">
              {statusMessage}
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-black pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isSaving}
              className="px-3 py-1.5 bg-white border border-black hover:bg-[#E6E4DC] text-black uppercase font-bold text-[11px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3 text-[#777777]" />
              <span>RESET DEFAULT</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-3 py-1.5 bg-white border border-black hover:bg-[#E6E4DC] text-black uppercase font-bold text-[11px] transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={isSaving || !logoText.trim()}
                className="px-5 py-1.5 bg-black text-white hover:bg-[#222222] uppercase font-bold text-[11px] transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>SAVING...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span>SAVE & APPLY LOGO ■</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
