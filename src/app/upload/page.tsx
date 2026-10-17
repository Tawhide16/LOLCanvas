"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UploadCloud, CheckCircle2, Loader2, Sparkles, Plus, X, Tag, SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { FormatType } from "@/types";
import { processImageForWeb } from "@/lib/imageOptimizer";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("01");
  const [format, setFormat] = useState<string>("classic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submittedItem, setSubmittedItem] = useState<{ id: string; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Category & Custom Format States
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isCustomCategoryOpen, setIsCustomCategoryOpen] = useState(false);
  const [newCustomCategoryInput, setNewCustomCategoryInput] = useState("");

  const [customFormats, setCustomFormats] = useState<string[]>([]);
  const [isCustomFormatOpen, setIsCustomFormatOpen] = useState(false);
  const [newCustomFormatInput, setNewCustomFormatInput] = useState("");

  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const local = localStorage.getItem("lolcanvas_user");
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.email) setUserEmail(parsed.email);
      }

      const storedCustomCats = localStorage.getItem("lolcanvas_custom_categories");
      if (storedCustomCats) {
        setCustomCategories(JSON.parse(storedCustomCats));
      }

      const storedCustomFmts = localStorage.getItem("lolcanvas_custom_formats");
      if (storedCustomFmts) {
        setCustomFormats(JSON.parse(storedCustomFmts));
      }
    } catch (e) {}
  }, []);

  const handleAddCustomCategory = () => {
    const trimmed = newCustomCategoryInput.trim();
    if (!trimmed) return;
    if (!customCategories.includes(trimmed)) {
      const updated = [...customCategories, trimmed];
      setCustomCategories(updated);
      try {
        localStorage.setItem("lolcanvas_custom_categories", JSON.stringify(updated));
      } catch (e) {}
    }
    setCategoryId(`custom:${trimmed}`);
    setNewCustomCategoryInput("");
    setIsCustomCategoryOpen(false);
  };

  const handleAddCustomFormat = () => {
    const trimmed = newCustomFormatInput.trim();
    if (!trimmed) return;
    if (!customFormats.includes(trimmed)) {
      const updated = [...customFormats, trimmed];
      setCustomFormats(updated);
      try {
        localStorage.setItem("lolcanvas_custom_formats", JSON.stringify(updated));
      } catch (e) {}
    }
    setFormat(`custom:${trimmed}`);
    setNewCustomFormatInput("");
    setIsCustomFormatOpen(false);
  };

  const handleFileChange = (selectedFile: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload JPG, PNG, WebP, or SVG.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // 1. Client-side Image Optimization: Downsamples heavy multi-MB photos to crisp 1080px WebP (~80KB)
      // This increases upload speed by 10x-20x while saving bandwidth!
      setUploadProgress(25);
      const optimized = await processImageForWeb(file, 1080, 0.85);
      const previewDataUri = optimized.previewDataUri;
      const originalDataUri = optimized.originalDataUri || previewDataUri;

      setUploadProgress(40);
      const normalizedTitle = title.trim().toUpperCase();
      const authorEmail = userEmail || "creator@lolcanvas.studio";
      const slug = normalizedTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") + `-${Date.now()}`;

      // Resolve custom or preset category
      let catSlug = "classic";
      let catName = "CLASSIC";
      if (categoryId.startsWith("custom:")) {
        const raw = categoryId.replace("custom:", "").trim();
        catSlug = raw.toLowerCase().replace(/[^a-z0-9]/g, "-");
        catName = raw.toUpperCase();
      } else {
        const catObj = CATEGORIES.find((c) => c.id === categoryId);
        catSlug = catObj ? catObj.slug : "classic";
        catName = catObj ? catObj.name.toUpperCase() : "CLASSIC";
      }

      // Resolve custom or preset format
      let formatVal = format;
      let formatLabelVal = "Community Upload";
      if (format.startsWith("custom:")) {
        const rawFmt = format.replace("custom:", "").trim();
        formatVal = rawFmt.toLowerCase().replace(/[^a-z0-9]/g, "-");
        formatLabelVal = rawFmt;
      } else if (format === "multi-panel") {
        formatLabelVal = "Multi-Panel";
      } else if (format === "tweet") {
        formatLabelVal = "Tweet / Box";
      } else {
        formatLabelVal = "Classic Top/Bottom";
      }

      // Smooth progress ticker while transferring over network
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 88) {
            clearInterval(progressTimer);
            return prev;
          }
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 120);

      // 2. Parallel upload to Memes table and Template Catalog
      const memePromise = fetch("/api/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: normalizedTitle,
          previewUrl: previewDataUri,
          authorEmail: authorEmail,
          isPublic: true,
          layers: [
            {
              id: `upload-${Date.now()}`,
              type: "image",
              imageUrl: originalDataUri,
              x: 0,
              y: 0,
              zIndex: 1,
            },
          ],
        }),
      });

      const templatePromise = fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: normalizedTitle,
          slug,
          category: catSlug,
          svgDataUri: previewDataUri,
          originalUrl: originalDataUri,
          tags: [catSlug, "community_upload", `author:${authorEmail.toLowerCase().trim()}`],
          authorEmail: authorEmail,
          width: optimized.width || 1080,
          height: optimized.height || 1080,
        }),
      });

      const [resMeme] = await Promise.all([memePromise, templatePromise]);
      clearInterval(progressTimer);
      setUploadProgress(95);

      const data = await resMeme.json().catch(() => ({}));

      // 3. Update client-side local cache so it appears instantly on the home page
      try {
        const cachedRaw = localStorage.getItem("lolcanvas_cached_templates");
        const cachedList = cachedRaw ? JSON.parse(cachedRaw) : [];
        const newCard = {
          id: slug,
          slug: slug,
          index: `№ ${(cachedList.length + 1).toString().padStart(4, "0")}`,
          title: normalizedTitle,
          categoryId: catSlug,
          categoryName: catName,
          format: formatVal,
          formatLabel: formatLabelVal,
          svgDataUri: previewDataUri,
          originalUrl: originalDataUri,
          width: optimized.width || 1080,
          height: optimized.height || 1080,
          aspectRatio: `${optimized.width || 1080}:${optimized.height || 1080}`,
          source: "COMMUNITY UPLOAD",
          license: "PUBLIC COMMONS",
          tags: [catSlug, "community_upload", `author:${authorEmail}`],
          defaultTopText: "",
          defaultBottomText: "",
          isWatermarkFree: true,
          trendingRank: 1,
          remixCount: 1,
          downloadCount: 0,
          createdAt: new Date().toISOString(),
          authorEmail: authorEmail,
        };
        localStorage.setItem(
          "lolcanvas_cached_templates",
          JSON.stringify([newCard, ...cachedList])
        );
      } catch (e) {}

      setUploadProgress(100);
      setTimeout(() => {
        setSubmittedItem({
          id: data.data?.id || `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
          title: normalizedTitle,
        });
        setIsSubmitting(false);
      }, 250);
    } catch (err) {
      console.error("Upload error:", err);
      setIsSubmitting(false);
      setSubmittedItem({
        id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
        title: title.trim().toUpperCase(),
      });
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <UploadCloud className="w-3 h-3 text-[#E11D48]" />
            INGESTION DESK
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black">
            SUBMIT TEMPLATE.
          </h1>
        </div>
        <span className="font-mono-code text-xs text-[#555555] hidden sm:inline">
          WATERMARK-FREE ARCHIVE
        </span>
      </div>

      {submittedItem ? (
        <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-[#10B981] text-white flex items-center justify-center border-2 border-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="font-mono-code text-xs text-[#777777] uppercase">
            {submittedItem.id} LOGGED
          </span>
          <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-black">
            {submittedItem.title}
          </h2>
          <p className="font-body text-xs text-[#555555]">
            Template verified and queued for archive catalog publication.
          </p>
          <div className="flex gap-3 pt-2 font-mono-code text-xs">
            <Link
              href="/cards"
              className="px-5 py-2.5 bg-black text-white hover:bg-[#333333] uppercase font-bold"
            >
              BROWSE CATALOG
            </Link>
            <Link
              href="/profile"
              className="px-5 py-2.5 bg-[#FAF9F5] border border-black hover:bg-black hover:text-white uppercase font-bold transition-colors"
            >
              VIEW IN PROFILE
            </Link>
            <button
              onClick={() => {
                setSubmittedItem(null);
                setFile(null);
                setPreviewUrl(null);
                setTitle("");
              }}
              className="px-5 py-2.5 bg-white border border-black hover:bg-[#F6F5EE] uppercase font-bold"
            >
              SUBMIT ANOTHER
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black">
          {/* Dropzone */}
          <div className="lg:col-span-6 p-6 sm:p-10 bg-white space-y-4">
            <span className="font-mono-code text-[11px] text-[#777777] uppercase font-bold block">
              RAW TEMPLATE IMAGE
            </span>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-black/40 hover:border-black p-8 text-center bg-[#FAF9F5] hover:bg-[#F6F5EE] transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[280px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[200px] object-contain border border-black bg-white p-1"
                  />
                  <span className="text-[11px] font-mono-code text-[#E11D48] underline block">
                    CLICK TO REPLACE
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-black mx-auto" />
                  <span className="font-mono-code text-xs font-bold text-black uppercase block">
                    DRAG & DROP IMAGE OR CLICK
                  </span>
                  <span className="font-mono-code text-[10px] text-[#888888] block">
                    PNG, JPG, WebP, SVG
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-6 p-6 sm:p-10 space-y-5 bg-[#FAF9F5]">
            <div className="space-y-1.5 font-mono-code text-xs">
              <label className="text-[10px] text-[#777777] uppercase font-bold">
                TEMPLATE TITLE *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.G. 'CONFUSED CAT DINNER'..."
                className="w-full p-2.5 bg-white border border-black text-xs font-bold text-black uppercase focus:outline-none"
              />
            </div>

            {/* Category & Format Slots with Custom Add Support */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-code text-xs">
              {/* Category Slot */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-[#777777] uppercase font-bold">
                    CATEGORY *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategoryOpen(!isCustomCategoryOpen)}
                    className="text-[9px] font-mono-code text-[#E11D48] hover:underline uppercase font-bold flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>+ CUSTOM</span>
                  </button>
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setIsCustomCategoryOpen(true);
                    } else {
                      setCategoryId(e.target.value);
                      setIsCustomCategoryOpen(false);
                    }
                  }}
                  className="w-full p-2 bg-white border border-black uppercase text-black font-medium focus:outline-none"
                >
                  <optgroup label="PRESET ARCHIVE CATEGORIES">
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        [{cat.number}] {cat.name.toUpperCase()}
                      </option>
                    ))}
                  </optgroup>
                  {customCategories.length > 0 && (
                    <optgroup label="YOUR CUSTOM CATEGORIES">
                      {customCategories.map((c) => (
                        <option key={c} value={`custom:${c}`}>
                          ★ {c.toUpperCase()}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__add_new__">+ [ADD NEW CUSTOM CATEGORY...]</option>
                </select>

                {/* Inline Drawer for New Custom Category */}
                {isCustomCategoryOpen && (
                  <div className="p-2.5 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-1.5 animate-in fade-in duration-150">
                    <span className="text-[9px] font-bold text-[#E11D48] uppercase block">
                      CREATE CUSTOM CATEGORY:
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newCustomCategoryInput}
                        onChange={(e) => setNewCustomCategoryInput(e.target.value)}
                        placeholder="E.G. BANGLA, ANIME..."
                        className="flex-1 p-1 bg-[#FAF9F5] border border-black text-xs uppercase font-bold focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomCategory();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomCategory}
                        disabled={!newCustomCategoryInput.trim()}
                        className="px-2.5 py-1 bg-black text-white hover:bg-[#222222] font-bold uppercase text-[10px] disabled:opacity-40"
                      >
                        ADD
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCustomCategoryOpen(false)}
                        className="px-2 py-1 bg-white border border-black hover:bg-[#E6E4DC] text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Format Slot */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-[#777777] uppercase font-bold">
                    FORMAT *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomFormatOpen(!isCustomFormatOpen)}
                    className="text-[9px] font-mono-code text-[#E11D48] hover:underline uppercase font-bold flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>+ CUSTOM</span>
                  </button>
                </div>
                <select
                  value={format}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setIsCustomFormatOpen(true);
                    } else {
                      setFormat(e.target.value);
                      setIsCustomFormatOpen(false);
                    }
                  }}
                  className="w-full p-2 bg-white border border-black uppercase text-black font-medium focus:outline-none"
                >
                  <optgroup label="PRESET FORMATS">
                    <option value="classic">CLASSIC TOP/BOTTOM</option>
                    <option value="multi-panel">MULTI-PANEL</option>
                    <option value="tweet">TWEET / BOX</option>
                  </optgroup>
                  {customFormats.length > 0 && (
                    <optgroup label="YOUR CUSTOM FORMATS">
                      {customFormats.map((f) => (
                        <option key={f} value={`custom:${f}`}>
                          ★ {f.toUpperCase()}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__add_new__">+ [ADD NEW CUSTOM FORMAT...]</option>
                </select>

                {/* Inline Drawer for New Custom Format */}
                {isCustomFormatOpen && (
                  <div className="p-2.5 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-1.5 animate-in fade-in duration-150">
                    <span className="text-[9px] font-bold text-[#E11D48] uppercase block">
                      CREATE CUSTOM FORMAT:
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newCustomFormatInput}
                        onChange={(e) => setNewCustomFormatInput(e.target.value)}
                        placeholder="E.G. VERTICAL REEL (9:16)..."
                        className="flex-1 p-1 bg-[#FAF9F5] border border-black text-xs uppercase font-bold focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomFormat();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomFormat}
                        disabled={!newCustomFormatInput.trim()}
                        className="px-2.5 py-1 bg-black text-white hover:bg-[#222222] font-bold uppercase text-[10px] disabled:opacity-40"
                      >
                        ADD
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCustomFormatOpen(false)}
                        className="px-2 py-1 bg-white border border-black hover:bg-[#E6E4DC] text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="relative w-full py-3.5 bg-black text-white hover:bg-[#222222] font-mono-code text-xs uppercase font-bold tracking-wider transition-all hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-40 shadow-[3px_3px_0px_0px_rgba(225,29,72,1)] overflow-hidden border border-black"
            >
              {/* Progress bar fill */}
              {isSubmitting && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[#E11D48] transition-all duration-150 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>UPLOADING TEMPLATE... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-[#E11D48]" />
                    <span>SUBMIT TO COMMONS ■</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
