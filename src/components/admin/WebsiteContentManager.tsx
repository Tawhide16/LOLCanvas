"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Type,
  Image as ImageIcon,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sliders,
  Eye,
  Info,
  Palette,
  Layout,
  Upload,
  Menu,
} from "lucide-react";
import { useSiteContent, SiteConfigType } from "@/lib/useSiteContent";
import { DEFAULT_SITE_CONFIG } from "@/app/api/admin/site-config/route";

interface WebsiteContentManagerProps {
  adminEmail?: string;
  onSuccess?: () => void;
}

export default function WebsiteContentManager({ adminEmail, onSuccess }: WebsiteContentManagerProps) {
  const { content } = useSiteContent();
  const [formData, setFormData] = useState<SiteConfigType>({
    ...DEFAULT_SITE_CONFIG,
    ...content,
  });

  const [activeSubTab, setActiveSubTab] = useState<
    "hero" | "navbar" | "typography" | "images" | "submission" | "pages" | "footer" | "about"
  >("hero");

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Sync when initial content is loaded
  useEffect(() => {
    if (content) {
      setFormData((prev) => ({
        ...DEFAULT_SITE_CONFIG,
        ...prev,
        ...content,
      }));
    }
  }, [content]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [field]: value,
      },
    }));
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all website content, images, and text size configurations back to system defaults?")) {
      setFormData({ ...DEFAULT_SITE_CONFIG });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    setStatusMessage("");

    try {
      const res = await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          adminEmail: adminEmail || "admin123@gmail.com",
          role: "SUPER_ADMIN",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save configuration");
      }

      setSaveStatus("success");
      setStatusMessage("All website content, images, and text sizes saved & applied live across LOLCanvas!");

      // Broadcast update event so open pages update in real-time
      if (typeof window !== "undefined") {
        localStorage.setItem("lolcanvas_site_config", JSON.stringify(json.data));
        window.dispatchEvent(
          new CustomEvent("lolcanvas_content_changed", { detail: json.data })
        );
      }

      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSaveStatus("idle");
        setStatusMessage("");
      }, 5000);
    } catch (err: any) {
      setSaveStatus("error");
      setStatusMessage(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Top Header */}
      <div className="p-5 sm:p-6 border-b border-black bg-[#FAF9F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#E11D48] animate-pulse"></span>
            <span className="font-mono-code text-xs font-bold text-[#E11D48] uppercase tracking-wider">
              SUPER ADMIN MASTER CMS
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-black uppercase tracking-tight mt-1">
            WEBSITE CONTENT, IMAGES & TYPOGRAPHY MANAGER
          </h2>
          <p className="font-mono-code text-xs text-[#666666] mt-1 max-w-2xl">
            Live management of all website banners, section texts, artwork images, and font sizes across LOLCanvas outside template cards.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleResetDefaults}
            type="button"
            className="px-3.5 py-2.5 bg-white border border-black text-black hover:bg-[#F3F2EB] font-mono-code text-xs uppercase font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5"
            title="Reset to default Swiss Brutalist configuration"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RESET</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            type="button"
            className="px-5 py-2.5 bg-[#E11D48] text-white hover:bg-black border border-black font-mono-code text-xs uppercase font-extrabold transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
            {isSaving ? "SAVING..." : "SAVE & PUBLISH LIVE ■"}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {statusMessage && (
        <div
          className={`px-6 py-3 border-b border-black font-mono-code text-xs flex items-center gap-2 ${
            saveStatus === "success"
              ? "bg-[#DCFCE7] text-[#166534]"
              : "bg-[#FEE2E2] text-[#991B1B]"
          }`}
        >
          {saveStatus === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="font-bold">{statusMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-black bg-[#FAF9F5] overflow-x-auto divide-x divide-black font-mono-code text-xs">
        <button
          onClick={() => setActiveSubTab("hero")}
          className={`px-4 py-3 shrink-0 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeSubTab === "hero" ? "bg-black text-white" : "text-black hover:bg-[#F0EEE6]"
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>[HERO & BANNER]</span>
        </button>

        <button
          onClick={() => setActiveSubTab("navbar")}
          className={`px-4 py-3 shrink-0 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeSubTab === "navbar" ? "bg-black text-white" : "text-black hover:bg-[#F0EEE6]"
          }`}
        >
          <Menu className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>[NAVBAR & BUTTONS]</span>
        </button>

        <button
          onClick={() => setActiveSubTab("typography")}
          className={`px-4 py-3 shrink-0 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeSubTab === "typography" ? "bg-black text-white" : "text-black hover:bg-[#F0EEE6]"
          }`}
        >
          <Type className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>[TEXT SIZES & TYPOGRAPHY]</span>
        </button>

        <button
          onClick={() => setActiveSubTab("images")}
          className={`px-4 py-3 shrink-0 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeSubTab === "images" ? "bg-black text-white" : "text-black hover:bg-[#F0EEE6]"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>[SITE IMAGES & ARTWORK]</span>
        </button>

        <button
          onClick={() => setActiveSubTab("submission")}
          className={`px-4 py-3 shrink-0 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeSubTab === "submission" ? "bg-black text-white" : "text-black hover:bg-[#F0EEE6]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>[COMMONS CALLOUT]</span>
        </button>

        <button
          onClick={() => setActiveSubTab("pages")}
          className={`px-4 py-3 shrink-0 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeSubTab === "pages" ? "bg-black text-white" : "text-black hover:bg-[#F0EEE6]"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>[SECTIONS & PAGES]</span>
        </button>

        <button
          onClick={() => setActiveSubTab("footer")}
          className={`px-4 py-3 shrink-0 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeSubTab === "footer" ? "bg-black text-white" : "text-black hover:bg-[#F0EEE6]"
          }`}
        >
          <Info className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>[FOOTER & BRAND]</span>
        </button>

        <button
          onClick={() => setActiveSubTab("about")}
          className={`px-4 py-3 shrink-0 font-bold uppercase transition-colors flex items-center gap-2 ${
            activeSubTab === "about" ? "bg-black text-white" : "text-black hover:bg-[#F0EEE6]"
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>[DEVELOPER / ABOUT]</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: HERO & BANNER */}
        {/* ========================================================= */}
        {activeSubTab === "hero" && (
          <div className="space-y-6">
            <div className="border border-black p-4 bg-[#FAF9F5] flex items-center justify-between">
              <div className="font-mono-code text-xs text-[#555555]">
                <strong className="text-black uppercase">HOME HERO SECTION:</strong> Changes take effect immediately on the homepage.
              </div>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="font-mono-code text-xs text-[#E11D48] hover:underline font-bold flex items-center gap-1"
              >
                OPEN HOMEPAGE <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Headlines & Subtitles */}
              <div className="space-y-4">
                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    HERO TOP BADGE TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.heroBadge || ""}
                    onChange={(e) => handleChange("heroBadge", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="e.g. OPEN MEME ARCHIVE & CANVAS ENGINE"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    HEADLINE LINE 1 (BLACK TEXT)
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitle1 || ""}
                    onChange={(e) => handleChange("heroTitle1", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-display font-black text-lg focus:outline-none focus:ring-1 focus:ring-black uppercase"
                    placeholder="e.g. MEMES THAT"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    HEADLINE LINE 2 (UNDERLINED ACCENT)
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitle2 || ""}
                    onChange={(e) => handleChange("heroTitle2", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-display font-black text-lg focus:outline-none focus:ring-1 focus:ring-black uppercase"
                    placeholder="e.g. MAKE NOISE."
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    SUBTITLE DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={formData.heroSubtitle || ""}
                    onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-body text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Editorial, watermark-free template archive..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-mono-code text-[11px] font-bold uppercase text-black mb-1">
                      BUTTON 1 TEXT (PRIMARY)
                    </label>
                    <input
                      type="text"
                      value={formData.heroButton1Text || "OPEN CANVAS EDITOR ■"}
                      onChange={(e) => handleChange("heroButton1Text", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-black font-mono-code text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-code text-[11px] font-bold uppercase text-black mb-1">
                      BUTTON 2 TEXT (OUTLINE)
                    </label>
                    <input
                      type="text"
                      value={formData.heroButton2Text || "BROWSE ARCHIVE →"}
                      onChange={(e) => handleChange("heroButton2Text", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-black font-mono-code text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Metrics & Manifesto Quote */}
              <div className="space-y-4">
                <div className="p-4 border border-black bg-[#FAF9F5] space-y-3">
                  <div className="font-mono-code text-xs font-bold uppercase text-black">
                    HERO METRIC STRIP (4 STAT COUNTERS)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono-code text-[#666666] uppercase">METRIC 1 (LABEL / VALUE)</label>
                      <input
                        type="text"
                        value={formData.heroMetric1Label || ""}
                        onChange={(e) => handleChange("heroMetric1Label", e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-black text-xs font-mono-code mb-1"
                      />
                      <input
                        type="text"
                        value={formData.heroMetric1Value || ""}
                        onChange={(e) => handleChange("heroMetric1Value", e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-black text-xs font-black font-mono-code"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono-code text-[#666666] uppercase">METRIC 2 (LABEL / VALUE)</label>
                      <input
                        type="text"
                        value={formData.heroMetric2Label || ""}
                        onChange={(e) => handleChange("heroMetric2Label", e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-black text-xs font-mono-code mb-1"
                      />
                      <input
                        type="text"
                        value={formData.heroMetric2Value || ""}
                        onChange={(e) => handleChange("heroMetric2Value", e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-black text-xs font-black font-mono-code text-[#E11D48]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono-code text-[#666666] uppercase">METRIC 3 (LABEL / VALUE)</label>
                      <input
                        type="text"
                        value={formData.heroMetric3Label || ""}
                        onChange={(e) => handleChange("heroMetric3Label", e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-black text-xs font-mono-code mb-1"
                      />
                      <input
                        type="text"
                        value={formData.heroMetric3Value || ""}
                        onChange={(e) => handleChange("heroMetric3Value", e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-black text-xs font-black font-mono-code"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono-code text-[#666666] uppercase">METRIC 4 (LABEL / VALUE)</label>
                      <input
                        type="text"
                        value={formData.heroMetric4Label || ""}
                        onChange={(e) => handleChange("heroMetric4Label", e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-black text-xs font-mono-code mb-1"
                      />
                      <input
                        type="text"
                        value={formData.heroMetric4Value || ""}
                        onChange={(e) => handleChange("heroMetric4Value", e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-black text-xs font-black font-mono-code"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-black bg-black text-white space-y-3">
                  <div className="font-mono-code text-xs font-bold uppercase text-[#E11D48]">
                    STUDIO MANIFESTO PANEL
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono-code uppercase text-[#888888] mb-1">
                      MANIFESTO TAG
                    </label>
                    <input
                      type="text"
                      value={formData.manifestoTag || ""}
                      onChange={(e) => handleChange("manifestoTag", e.target.value)}
                      className="w-full px-2 py-1 bg-[#1A1A1A] border border-[#333333] text-white text-xs font-mono-code"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono-code uppercase text-[#888888] mb-1">
                      MANIFESTO QUOTE HEADLINE
                    </label>
                    <textarea
                      rows={2}
                      value={formData.manifestoQuote || ""}
                      onChange={(e) => handleChange("manifestoQuote", e.target.value)}
                      className="w-full px-2 py-1 bg-[#1A1A1A] border border-[#333333] text-white text-xs font-display font-extrabold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: NAVBAR & BUTTONS CMS                                */}
        {/* ========================================================= */}
        {activeSubTab === "navbar" && (
          <div className="space-y-6">
            <div className="border border-black p-4 bg-[#FAF9F5] flex items-center justify-between">
              <div>
                <span className="font-mono-code text-xs font-bold text-[#E11D48] uppercase">
                  NAVBAR LINKS & WEBSITE BUTTONS CMS:
                </span>
                <p className="font-mono-code text-xs text-[#555555] mt-0.5">
                  Customize the text of all 5 navigation links, search placeholder, upload button, and buttons across the entire website.
                </p>
              </div>
            </div>

            {/* Live Interactive Navbar Preview */}
            <div className="border border-black bg-white p-4 space-y-2">
              <span className="font-mono-code text-[11px] font-bold uppercase text-[#777777]">
                LIVE NAVBAR PREVIEW:
              </span>
              <div className="border border-black bg-[#FAF9F5] flex items-center divide-x divide-black text-xs font-mono-code overflow-x-auto">
                <div className="px-4 py-3 font-display font-black uppercase flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 bg-black"></span>
                  <span>{formData.logoText || "LOLCANVAS"}{formData.logoTag || "®"}</span>
                </div>
                <div className="px-4 py-3 text-[#777777] flex-1 truncate shrink-0">
                  {formData.navSearchPlaceholder || "SEARCH TEMPLATES (MAGIC FILTER)..."}
                </div>
                <div className="px-3 py-3 font-medium shrink-0 bg-white">
                  {formData.navItem1Text || "TEMPLATES"}
                </div>
                <div className="px-3 py-3 font-medium shrink-0">
                  {formData.navItem2Text || "CATEGORIES"}
                </div>
                <div className="px-3 py-3 font-medium shrink-0">
                  {formData.navItem3Text || "CANVAS EDITOR"}
                </div>
                <div className="px-3 py-3 font-medium shrink-0">
                  {formData.navItem4Text || "ABOUT"}
                </div>
                <div className="px-3 py-3 font-medium shrink-0">
                  {formData.navItem5Text || "CONTACT"}
                </div>
                <div className="px-4 py-3 font-bold bg-[#FAF9F5] text-black shrink-0 flex items-center gap-1">
                  <span className="text-[#E11D48]">+</span>
                  <span>{formData.navUploadButtonText || "UPLOAD"}</span>
                </div>
                <div className="px-4 py-3 font-bold bg-[#FFE4E6] text-[#E11D48] shrink-0">
                  {formData.navAdminButtonText || "SUPER ADMIN"}
                </div>
              </div>
            </div>

            {/* Grid Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Navbar Navigation Links */}
              <div className="border border-black p-5 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    NAVBAR MENU ITEM TEXTS (5 LINKS)
                  </span>
                  <span className="text-[10px] font-mono-code text-[#777777]">MAIN HEADER</span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    LINK 1 TEXT (/cards)
                  </label>
                  <input
                    type="text"
                    value={formData.navItem1Text || ""}
                    onChange={(e) => handleChange("navItem1Text", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold uppercase"
                    placeholder="TEMPLATES"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    LINK 2 TEXT (/collection)
                  </label>
                  <input
                    type="text"
                    value={formData.navItem2Text || ""}
                    onChange={(e) => handleChange("navItem2Text", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold uppercase"
                    placeholder="CATEGORIES"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    LINK 3 TEXT (/edit)
                  </label>
                  <input
                    type="text"
                    value={formData.navItem3Text || ""}
                    onChange={(e) => handleChange("navItem3Text", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold uppercase"
                    placeholder="CANVAS EDITOR"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    LINK 4 TEXT (/about)
                  </label>
                  <input
                    type="text"
                    value={formData.navItem4Text || ""}
                    onChange={(e) => handleChange("navItem4Text", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold uppercase"
                    placeholder="ABOUT"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    LINK 5 TEXT (/contact)
                  </label>
                  <input
                    type="text"
                    value={formData.navItem5Text || ""}
                    onChange={(e) => handleChange("navItem5Text", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold uppercase"
                    placeholder="CONTACT"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    NAVBAR MENU FONT SIZE
                  </label>
                  <select
                    value={formData.navbarTextSize || "sm"}
                    onChange={(e) => handleChange("navbarTextSize", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold cursor-pointer"
                  >
                    <option value="xs">Compact (10px - 11px)</option>
                    <option value="sm">Standard (11px - 12px) [DEFAULT]</option>
                    <option value="base">Prominent (13px - 14px)</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Search Box & Global Action Buttons */}
              <div className="border border-black p-5 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    NAVBAR BUTTONS & GLOBAL CALLS-TO-ACTION
                  </span>
                  <span className="text-[10px] font-mono-code text-[#777777]">ALL BUTTONS</span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    NAVBAR UPLOAD BUTTON TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.navUploadButtonText || ""}
                    onChange={(e) => handleChange("navUploadButtonText", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold uppercase"
                    placeholder="UPLOAD"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    SEARCH BAR PLACEHOLDER TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.navSearchPlaceholder || ""}
                    onChange={(e) => handleChange("navSearchPlaceholder", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs uppercase"
                    placeholder="SEARCH TEMPLATES (MAGIC FILTER)..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    SUPER ADMIN PORTAL BUTTON TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.navAdminButtonText || ""}
                    onChange={(e) => handleChange("navAdminButtonText", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold uppercase"
                    placeholder="SUPER ADMIN"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    CREATOR SIGN-IN BUTTON TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.headerLoginButtonText || ""}
                    onChange={(e) => handleChange("headerLoginButtonText", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold uppercase"
                    placeholder="SIGN IN"
                  />
                </div>

                <div className="pt-2 border-t border-black/20 space-y-3">
                  <span className="font-mono-code text-[11px] font-bold uppercase text-[#E11D48] block">
                    CARD & REMIX BUTTONS:
                  </span>
                  <div>
                    <label className="block text-[10px] font-mono-code text-[#666666] uppercase">
                      CARD REMIX IN CANVAS BUTTON
                    </label>
                    <input
                      type="text"
                      value={formData.cardRemixButtonText || "REMIX IN CANVAS"}
                      onChange={(e) => handleChange("cardRemixButtonText", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-black font-mono-code text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono-code text-[#666666] uppercase">
                      CARD DOWNLOAD PNG BUTTON
                    </label>
                    <input
                      type="text"
                      value={formData.cardDownloadButtonText || "DOWNLOAD PNG"}
                      onChange={(e) => handleChange("cardDownloadButtonText", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-black font-mono-code text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TEXT SIZES & TYPOGRAPHY SCALING */}
        {/* ========================================================= */}
        {activeSubTab === "typography" && (
          <div className="space-y-6">
            <div className="border border-black p-4 bg-[#FAF9F5] flex items-center justify-between">
              <div>
                <span className="font-mono-code text-xs font-bold text-[#E11D48] uppercase">
                  TYPOGRAPHY & FONT SIZE SCALING:
                </span>
                <p className="font-mono-code text-xs text-[#555555] mt-0.5">
                  Customize the exact font sizes across all sections of the site (Hero Headline, Subtitles, Badges, Section Titles, Footers).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Hero Title Font Size */}
              <div className="border border-black p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    HERO HEADLINE SIZE
                  </span>
                  <span className="bg-black text-white text-[10px] font-mono-code px-1.5 py-0.5 font-bold">
                    {formData.heroTitleSize || "8xl"}
                  </span>
                </div>
                <select
                  value={formData.heroTitleSize || "8xl"}
                  onChange={(e) => handleChange("heroTitleSize", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold cursor-pointer"
                >
                  <option value="5xl">Small (5xl - 48px)</option>
                  <option value="6xl">Medium (6xl - 60px)</option>
                  <option value="7xl">Standard (7xl - 72px)</option>
                  <option value="8xl">Large (8xl - 88px) [DEFAULT]</option>
                  <option value="9xl">Massive Brutalist (9xl - 104px)</option>
                </select>
                <div className="p-3 bg-[#FAF9F5] border border-black/20 text-center overflow-hidden">
                  <span className="font-display font-black text-black block truncate" style={{
                    fontSize:
                      formData.heroTitleSize === "5xl" ? "24px" :
                      formData.heroTitleSize === "6xl" ? "28px" :
                      formData.heroTitleSize === "7xl" ? "34px" :
                      formData.heroTitleSize === "9xl" ? "44px" : "38px"
                  }}>
                    {formData.heroTitle1 || "MEMES THAT"}
                  </span>
                </div>
              </div>

              {/* 2. Hero Subtitle Font Size */}
              <div className="border border-black p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    HERO SUBTITLE SIZE
                  </span>
                  <span className="bg-black text-white text-[10px] font-mono-code px-1.5 py-0.5 font-bold">
                    {formData.heroSubtitleSize || "lg"}
                  </span>
                </div>
                <select
                  value={formData.heroSubtitleSize || "lg"}
                  onChange={(e) => handleChange("heroSubtitleSize", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold cursor-pointer"
                >
                  <option value="xs">Extra Small (xs - 12px)</option>
                  <option value="sm">Small (sm - 14px)</option>
                  <option value="base">Standard (base - 16px)</option>
                  <option value="lg">Large (lg - 18px) [DEFAULT]</option>
                  <option value="xl">Extra Large (xl - 20px)</option>
                </select>
                <div className="p-3 bg-[#FAF9F5] border border-black/20">
                  <p className="font-body text-[#555555] line-clamp-2" style={{
                    fontSize:
                      formData.heroSubtitleSize === "xs" ? "11px" :
                      formData.heroSubtitleSize === "sm" ? "13px" :
                      formData.heroSubtitleSize === "base" ? "15px" :
                      formData.heroSubtitleSize === "xl" ? "19px" : "17px"
                  }}>
                    {formData.heroSubtitle || "Editorial, watermark-free template archive..."}
                  </p>
                </div>
              </div>

              {/* 3. Manifesto Quote Font Size */}
              <div className="border border-black p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    MANIFESTO QUOTE SIZE
                  </span>
                  <span className="bg-black text-white text-[10px] font-mono-code px-1.5 py-0.5 font-bold">
                    {formData.manifestoQuoteSize || "3xl"}
                  </span>
                </div>
                <select
                  value={formData.manifestoQuoteSize || "3xl"}
                  onChange={(e) => handleChange("manifestoQuoteSize", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold cursor-pointer"
                >
                  <option value="xl">Small (xl - 20px)</option>
                  <option value="2xl">Medium (2xl - 24px)</option>
                  <option value="3xl">Standard (3xl - 30px) [DEFAULT]</option>
                  <option value="4xl">Hero Bold (4xl - 36px)</option>
                </select>
                <div className="p-3 bg-black text-white">
                  <blockquote className="font-display font-extrabold truncate" style={{
                    fontSize:
                      formData.manifestoQuoteSize === "xl" ? "16px" :
                      formData.manifestoQuoteSize === "2xl" ? "20px" :
                      formData.manifestoQuoteSize === "4xl" ? "28px" : "24px"
                  }}>
                    “{formData.manifestoQuote || "GOOD MEMES ARE CULTURE."}”
                  </blockquote>
                </div>
              </div>

              {/* 4. Submission Callout Headline Size */}
              <div className="border border-black p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    COMMONS TITLE SIZE
                  </span>
                  <span className="bg-black text-white text-[10px] font-mono-code px-1.5 py-0.5 font-bold">
                    {formData.submissionTitleSize || "3xl"}
                  </span>
                </div>
                <select
                  value={formData.submissionTitleSize || "3xl"}
                  onChange={(e) => handleChange("submissionTitleSize", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold cursor-pointer"
                >
                  <option value="xl">Compact (xl - 20px)</option>
                  <option value="2xl">Medium (2xl - 24px)</option>
                  <option value="3xl">Standard (3xl - 30px) [DEFAULT]</option>
                  <option value="4xl">Prominent (4xl - 36px)</option>
                </select>
                <div className="p-3 bg-[#FAF9F5] border border-black/20">
                  <span className="font-display font-black text-black uppercase block truncate" style={{
                    fontSize:
                      formData.submissionTitleSize === "xl" ? "18px" :
                      formData.submissionTitleSize === "2xl" ? "22px" :
                      formData.submissionTitleSize === "4xl" ? "30px" : "26px"
                  }}>
                    {formData.submissionTitle || "SUBMIT TO THE ARCHIVE."}
                  </span>
                </div>
              </div>

              {/* 5. Section Heading Size */}
              <div className="border border-black p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    CATALOG / STRIP HEADER
                  </span>
                  <span className="bg-black text-white text-[10px] font-mono-code px-1.5 py-0.5 font-bold">
                    {formData.catalogTitleSize || "sm"}
                  </span>
                </div>
                <select
                  value={formData.catalogTitleSize || "sm"}
                  onChange={(e) => handleChange("catalogTitleSize", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold cursor-pointer"
                >
                  <option value="xs">Micro (xs - 12px)</option>
                  <option value="sm">Standard (sm - 14px) [DEFAULT]</option>
                  <option value="base">Bold Medium (base - 16px)</option>
                  <option value="lg">Expanded (lg - 18px)</option>
                </select>
                <div className="p-3 bg-[#FAF9F5] border border-black/20 flex items-center gap-2">
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="font-display font-extrabold text-black uppercase" style={{
                    fontSize:
                      formData.catalogTitleSize === "xs" ? "11px" :
                      formData.catalogTitleSize === "base" ? "15px" :
                      formData.catalogTitleSize === "lg" ? "17px" : "13px"
                  }}>
                    ARCHIVE CATALOG
                  </span>
                </div>
              </div>

              {/* 6. Footer Text Size */}
              <div className="border border-black p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    FOOTER DESCRIPTION SIZE
                  </span>
                  <span className="bg-black text-white text-[10px] font-mono-code px-1.5 py-0.5 font-bold">
                    {formData.footerDescriptionSize || "xs"}
                  </span>
                </div>
                <select
                  value={formData.footerDescriptionSize || "xs"}
                  onChange={(e) => handleChange("footerDescriptionSize", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold cursor-pointer"
                >
                  <option value="2xs">Tiny (10px)</option>
                  <option value="xs">Standard (11px) [DEFAULT]</option>
                  <option value="sm">Medium (13px)</option>
                  <option value="base">Comfortable (15px)</option>
                </select>
                <div className="p-3 bg-black text-[#888888]">
                  <p className="font-body" style={{
                    fontSize:
                      formData.footerDescriptionSize === "2xs" ? "10px" :
                      formData.footerDescriptionSize === "sm" ? "13px" :
                      formData.footerDescriptionSize === "base" ? "15px" : "11px"
                  }}>
                    {formData.footerDescription || "Editorial, watermark-free meme template archive..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SITE IMAGES & ARTWORK */}
        {/* ========================================================= */}
        {activeSubTab === "images" && (
          <div className="space-y-6">
            <div className="border border-black p-4 bg-[#FAF9F5]">
              <span className="font-mono-code text-xs font-bold text-[#E11D48] uppercase">
                ALL SITE IMAGES & ARTWORK:
              </span>
              <p className="font-mono-code text-xs text-[#555555] mt-0.5">
                Change site logos, hero banner visuals, commons callout images, and creator profile pictures with live previews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image 1: Main Brand Logo */}
              <div className="border border-black p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    1. BRAND LOGO IMAGE / ICON
                  </span>
                  <span className="text-[10px] font-mono-code text-[#777777]">PNG/SVG/JPG</span>
                </div>

                <div className="flex items-center gap-4 p-3 bg-[#FAF9F5] border border-black/20">
                  <img
                    src={formData.logoUrl || "/logo-icon.png"}
                    alt="Logo Preview"
                    className="w-12 h-12 object-contain bg-white border border-black p-1 rounded-xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/logo-icon.png";
                    }}
                  />
                  <div className="font-mono-code text-xs">
                    <div className="font-bold text-black uppercase">{formData.logoText || "LOLCANVAS"}</div>
                    <div className="text-[#666666] text-[10px]">Active header & navigation emblem</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    LOGO IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={formData.logoUrl || ""}
                    onChange={(e) => handleChange("logoUrl", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs"
                    placeholder="e.g. /logo-icon.png or https://..."
                  />
                </div>
              </div>

              {/* Image 2: Hero Banner Featured Artwork */}
              <div className="border border-black p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    2. HERO BANNER FEATURED ARTWORK
                  </span>
                  <span className="text-[10px] font-mono-code text-[#777777]">HERO PANEL</span>
                </div>

                <div className="relative aspect-video w-full bg-[#FAF9F5] border border-black overflow-hidden flex items-center justify-center">
                  {formData.heroBannerImageUrl ? (
                    <img
                      src={formData.heroBannerImageUrl}
                      alt="Hero Artwork Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="text-center p-4 font-mono-code text-xs text-[#777777]">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 text-black/30" />
                      No custom hero artwork URL set (Using default manifesto panel)
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    HERO ARTWORK IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={formData.heroBannerImageUrl || ""}
                    onChange={(e) => handleChange("heroBannerImageUrl", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {/* Image 3: Developer / Creator Profile Avatar */}
              <div className="border border-black p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    3. DEVELOPER / CREATOR AVATAR
                  </span>
                  <span className="text-[10px] font-mono-code text-[#777777]">ABOUT MODAL</span>
                </div>

                <div className="flex items-center gap-4 p-3 bg-[#FAF9F5] border border-black/20">
                  <img
                    src={formData.developerProfile?.avatarUrl || "/developer.jpg"}
                    alt="Developer Preview"
                    className="w-14 h-14 object-cover border border-black"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/developer.jpg";
                    }}
                  />
                  <div className="font-mono-code text-xs">
                    <div className="font-bold text-black uppercase">
                      {formData.developerProfile?.name || "Tawhid"}
                    </div>
                    <div className="text-[#666666] text-[10px]">
                      {formData.developerProfile?.role || "Lead Full-Stack Software Engineer"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    AVATAR IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={formData.developerProfile?.avatarUrl || ""}
                    onChange={(e) => handleNestedChange("developerProfile", "avatarUrl", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs"
                    placeholder="/developer.jpg or https://..."
                  />
                </div>
              </div>

              {/* Image 4: Submission Commons Banner Image */}
              <div className="border border-black p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold uppercase text-black">
                    4. SUBMISSION CALLOUT BANNER IMAGE
                  </span>
                  <span className="text-[10px] font-mono-code text-[#777777]">COMMONS STRIP</span>
                </div>

                <div className="h-20 w-full bg-black text-white p-3 border border-black flex items-center justify-between">
                  <div className="font-mono-code text-xs">
                    <div className="font-bold text-[#E11D48] text-[10px] uppercase">COMMONS CALLOUT</div>
                    <div className="text-white text-xs font-display font-bold">OPTIONAL ACCENT IMAGE</div>
                  </div>
                  {formData.submissionImageUrl ? (
                    <img
                      src={formData.submissionImageUrl}
                      alt="Commons Accent"
                      className="w-14 h-14 object-cover border border-white/20"
                    />
                  ) : (
                    <span className="font-mono-code text-[10px] text-[#777777]">NO IMAGE (SOLID BLACK)</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code text-black font-bold uppercase mb-1">
                    COMMONS IMAGE URL (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={formData.submissionImageUrl || ""}
                    onChange={(e) => handleChange("submissionImageUrl", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: COMMONS & SUBMISSION */}
        {/* ========================================================= */}
        {activeSubTab === "submission" && (
          <div className="space-y-6">
            <div className="border border-black p-4 bg-[#FAF9F5]">
              <span className="font-mono-code text-xs font-bold text-[#E11D48] uppercase">
                COMMONS SUBMISSION CALLOUT STRIP:
              </span>
              <p className="font-mono-code text-xs text-[#555555] mt-0.5">
                The high-contrast footer strip that invites community creators to upload and submit new templates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    CALLOUT BADGE TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.submissionBadge || ""}
                    onChange={(e) => handleChange("submissionBadge", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs uppercase"
                    placeholder="PUBLIC COMMONS"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    CALLOUT HEADLINE
                  </label>
                  <input
                    type="text"
                    value={formData.submissionTitle || ""}
                    onChange={(e) => handleChange("submissionTitle", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-display font-extrabold text-base uppercase"
                    placeholder="SUBMIT TO THE ARCHIVE."
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    CALLOUT BUTTON TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.submissionButtonText || "SUBMIT TEMPLATE"}
                    onChange={(e) => handleChange("submissionButtonText", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                  CALLOUT SUBTITLE PARAGRAPH
                </label>
                <textarea
                  rows={6}
                  value={formData.submissionSubtitle || ""}
                  onChange={(e) => handleChange("submissionSubtitle", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-black font-body text-xs"
                  placeholder="Join verified creators uploading watermark-free formats..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SECTIONS & PAGES */}
        {/* ========================================================= */}
        {activeSubTab === "pages" && (
          <div className="space-y-6">
            <div className="border border-black p-4 bg-[#FAF9F5]">
              <span className="font-mono-code text-xs font-bold text-[#E11D48] uppercase">
                CONTENT FOR CATEGORIES, CATALOG & TRENDING:
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Page Content */}
              <div className="border border-black p-4 bg-white space-y-3">
                <span className="font-mono-code text-xs font-bold uppercase text-black">
                  CATEGORIES PAGE (/collection)
                </span>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">PAGE TAG</label>
                  <input
                    type="text"
                    value={formData.collectionTag || ""}
                    onChange={(e) => handleChange("collectionTag", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-mono-code"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">PAGE TITLE</label>
                  <input
                    type="text"
                    value={formData.collectionTitle || ""}
                    onChange={(e) => handleChange("collectionTitle", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-display font-extrabold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={formData.collectionSubtitle || ""}
                    onChange={(e) => handleChange("collectionSubtitle", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-body"
                  />
                </div>
              </div>

              {/* Archive Catalog Content */}
              <div className="border border-black p-4 bg-white space-y-3">
                <span className="font-mono-code text-xs font-bold uppercase text-black">
                  CATALOG PAGE (/cards)
                </span>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">CATALOG TAG</label>
                  <input
                    type="text"
                    value={formData.catalogTag || ""}
                    onChange={(e) => handleChange("catalogTag", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-mono-code"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">CATALOG TITLE</label>
                  <input
                    type="text"
                    value={formData.catalogTitle || ""}
                    onChange={(e) => handleChange("catalogTitle", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-display font-extrabold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">SUBTITLE BADGE</label>
                  <input
                    type="text"
                    value={formData.catalogSubtitle || ""}
                    onChange={(e) => handleChange("catalogSubtitle", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-mono-code"
                  />
                </div>
              </div>

              {/* Contact Desk */}
              <div className="border border-black p-4 bg-white space-y-3">
                <span className="font-mono-code text-xs font-bold uppercase text-black">
                  CONTACT DESK (/contact)
                </span>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">DESK TITLE</label>
                  <input
                    type="text"
                    value={formData.contactTitle || ""}
                    onChange={(e) => handleChange("contactTitle", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-display font-extrabold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">SUPPORT EMAIL</label>
                  <input
                    type="email"
                    value={formData.contactEmail || ""}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-mono-code"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">BUGS REPORT EMAIL</label>
                  <input
                    type="email"
                    value={formData.bugsEmail || ""}
                    onChange={(e) => handleChange("bugsEmail", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-mono-code"
                  />
                </div>
              </div>

              {/* Trending Strip */}
              <div className="border border-black p-4 bg-white space-y-3">
                <span className="font-mono-code text-xs font-bold uppercase text-black">
                  HOMEPAGE TRENDING STRIP
                </span>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">TRENDING BADGE</label>
                  <input
                    type="text"
                    value={formData.trendingBadge || ""}
                    onChange={(e) => handleChange("trendingBadge", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-mono-code"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">STRIP TITLE</label>
                  <input
                    type="text"
                    value={formData.trendingTitle || ""}
                    onChange={(e) => handleChange("trendingTitle", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-mono-code font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-code uppercase text-[#666666]">SUBTITLE LABEL</label>
                  <input
                    type="text"
                    value={formData.trendingSubtitle || ""}
                    onChange={(e) => handleChange("trendingSubtitle", e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-black text-xs font-mono-code"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: FOOTER & BRAND */}
        {/* ========================================================= */}
        {activeSubTab === "footer" && (
          <div className="space-y-6">
            <div className="border border-black p-4 bg-[#FAF9F5]">
              <span className="font-mono-code text-xs font-bold text-[#E11D48] uppercase">
                HEADER & FOOTER BRANDING:
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    BRAND LOGO TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.logoText || ""}
                    onChange={(e) => handleChange("logoText", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-display font-extrabold text-sm uppercase"
                    placeholder="LOLCANVAS"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    BRAND REGISTERED TAG (e.g. ®, ™)
                  </label>
                  <input
                    type="text"
                    value={formData.logoTag || ""}
                    onChange={(e) => handleChange("logoTag", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs"
                    placeholder="®"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    TOP BAR ANNOUNCEMENT
                  </label>
                  <input
                    type="text"
                    value={formData.topBarTitle || ""}
                    onChange={(e) => handleChange("topBarTitle", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    FOOTER DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={formData.footerDescription || ""}
                    onChange={(e) => handleChange("footerDescription", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-body text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    FOOTER COPYRIGHT NOTICE
                  </label>
                  <input
                    type="text"
                    value={formData.footerCopyright || ""}
                    onChange={(e) => handleChange("footerCopyright", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    SYSTEM STATUS TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.footerStatus || "OPERATIONAL"}
                    onChange={(e) => handleChange("footerStatus", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs font-bold text-[#15803D]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: DEVELOPER / ABOUT */}
        {/* ========================================================= */}
        {activeSubTab === "about" && (
          <div className="space-y-6">
            <div className="border border-black p-4 bg-[#FAF9F5]">
              <span className="font-mono-code text-xs font-bold text-[#E11D48] uppercase">
                DEVELOPER PROFILE & ABOUT MODAL CONTENT:
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    DEVELOPER FULL NAME
                  </label>
                  <input
                    type="text"
                    value={formData.developerProfile?.name || ""}
                    onChange={(e) => handleNestedChange("developerProfile", "name", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-display font-extrabold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    ROLE / PROFESSIONAL TITLE
                  </label>
                  <input
                    type="text"
                    value={formData.developerProfile?.role || ""}
                    onChange={(e) => handleNestedChange("developerProfile", "role", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    PORTFOLIO WEBSITE URL
                  </label>
                  <input
                    type="url"
                    value={formData.developerProfile?.portfolioUrl || ""}
                    onChange={(e) => handleNestedChange("developerProfile", "portfolioUrl", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    GITHUB PROFILE URL
                  </label>
                  <input
                    type="url"
                    value={formData.developerProfile?.githubUrl || ""}
                    onChange={(e) => handleNestedChange("developerProfile", "githubUrl", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-mono-code text-xs"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    DEVELOPER BIOGRAPHY (ABOUT SECTION)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.developerProfile?.bio || ""}
                    onChange={(e) => handleNestedChange("developerProfile", "bio", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-body text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    ABOUT MANIFESTO HEADLINE
                  </label>
                  <input
                    type="text"
                    value={formData.aboutContent?.manifestoHeadline || ""}
                    onChange={(e) => handleNestedChange("aboutContent", "manifestoHeadline", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-display font-extrabold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-xs font-bold uppercase text-black mb-1.5">
                    ABOUT MANIFESTO DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={formData.aboutContent?.manifestoDescription || ""}
                    onChange={(e) => handleNestedChange("aboutContent", "manifestoDescription", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black font-body text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 border-t border-black bg-[#FAF9F5] flex items-center justify-between">
        <div className="font-mono-code text-[11px] text-[#777777] hidden sm:block">
          ● All changes save directly to Supabase/Postgres & synchronize immediately across client sessions.
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleResetDefaults}
            type="button"
            className="px-4 py-2 bg-white border border-black text-black hover:bg-[#E6E4DC] font-mono-code text-xs font-bold"
          >
            DISCARD
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            type="button"
            className="px-6 py-2 bg-[#E11D48] text-white hover:bg-black border border-black font-mono-code text-xs uppercase font-extrabold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
            {isSaving ? "SAVING..." : "SAVE CHANGES ■"}
          </button>
        </div>
      </div>
    </div>
  );
}
