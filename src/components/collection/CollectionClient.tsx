"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  FolderGit2,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Tag,
  SlidersHorizontal,
} from "lucide-react";
import { CATEGORIES, TEMPLATES } from "@/lib/data";
import { Category, Template } from "@/types";

interface ExtendedCategory extends Category {
  isCustom?: boolean;
}

export default function CollectionClient() {
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "has_uploads">("all");
  const [mounted, setMounted] = useState(false);

  // Load local cache immediately, then fetch live data from DB/API
  useEffect(() => {
    setMounted(true);

    // 1. Read cached custom categories
    try {
      const storedCustom = localStorage.getItem("lolcanvas_custom_categories");
      if (storedCustom) {
        setCustomCategories(JSON.parse(storedCustom));
      }
    } catch (e) {}

    // 2. Read instant local cached templates
    try {
      const cached = localStorage.getItem("lolcanvas_cached_templates");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const removedIds: string[] = JSON.parse(
            localStorage.getItem("lolcanvas_removed_templates") || "[]"
          );
          const combined = deduplicateTemplates([...parsed, ...TEMPLATES], removedIds);
          setTemplates(combined);
        }
      }
    } catch (e) {}

    // 3. Background fetch latest templates and public memes from database
    async function fetchLiveTemplates() {
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.templates)) {
            const removedIds: string[] = JSON.parse(
              localStorage.getItem("lolcanvas_removed_templates") || "[]"
            );
            const combined = deduplicateTemplates(
              [...data.data.templates, ...TEMPLATES],
              removedIds
            );
            setTemplates(combined);
            try {
              localStorage.setItem(
                "lolcanvas_cached_templates",
                JSON.stringify(data.data.templates)
              );
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic templates:", err);
      }
    }

    fetchLiveTemplates();

    // Listen to storage changes so if a user uploads in another tab or modal, it updates immediately
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lolcanvas_cached_templates" && e.newValue) {
        try {
          const next = JSON.parse(e.newValue);
          setTemplates((prev) => deduplicateTemplates([...next, ...prev], []));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Helper to deduplicate templates by id and slug
  function deduplicateTemplates(list: Template[], removedIds: string[]): Template[] {
    const seen = new Set<string>();
    const results: Template[] = [];
    for (const item of list) {
      if (removedIds.includes(item.id) || removedIds.includes(item.slug)) continue;
      const key = (item.slug || item.id).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        results.push(item);
      }
    }
    return results;
  }

  // Check if a template is an uploaded reference / community suggestion
  function isUploadedReference(t: Template): boolean {
    const isBuiltIn = TEMPLATES.some(
      (bt) => bt.id === t.id || (bt.slug && bt.slug === t.slug)
    );
    if (!isBuiltIn) return true;

    const source = (t.source || "").toLowerCase();
    const hasUploadTag =
      t.tags?.includes("community_upload") ||
      t.tags?.includes("custom") ||
      t.tags?.some((tag: string) => tag.startsWith("author:"));

    return (
      source.includes("upload") ||
      source.includes("community") ||
      Boolean(t.authorEmail) ||
      Boolean(hasUploadTag)
    );
  }

  // Check if a template matches a specific category
  function matchesCategory(t: Template, cat: ExtendedCategory): boolean {
    const catId = (cat.id || "").toLowerCase();
    const catSlug = (cat.slug || "").toLowerCase();
    const catName = (cat.name || "").toLowerCase();

    const tCatId = (t.categoryId || "").toLowerCase();
    const tCatName = (t.categoryName || "").toLowerCase();
    const tCategory = ((t as any).category || "").toLowerCase();

    // Direct matches
    if (tCatId === catId || tCatId === catSlug || tCatId === catName) return true;
    if (tCatName === catName || tCatName === catSlug) return true;
    if (tCategory === catId || tCategory === catSlug || tCategory === catName) return true;

    // Check tags
    if (t.tags && Array.isArray(t.tags)) {
      if (
        t.tags.some((tag: string) => {
          const low = tag.toLowerCase();
          return low === catSlug || low === catName || low === catId;
        })
      ) {
        return true;
      }
    }

    return false;
  }

  // Combine standard categories and any user-created custom categories
  const allCategories: ExtendedCategory[] = useMemo(() => {
    const list: ExtendedCategory[] = [...CATEGORIES];

    // Detect custom categories from templates or local storage
    const customNames = new Set<string>(customCategories);

    templates.forEach((t) => {
      const isCustomCategory =
        t.categoryId?.startsWith("custom:") ||
        (t as any).category?.startsWith("custom:");
      if (isCustomCategory) {
        const raw = (t.categoryId || (t as any).category).replace("custom:", "").trim();
        if (raw) customNames.add(raw);
      }
    });

    let index = list.length + 1;
    customNames.forEach((name) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      // Check if already in standard categories
      if (!list.some((c) => c.slug === slug || c.name.toLowerCase() === name.toLowerCase())) {
        list.push({
          id: `custom:${slug}`,
          number: index.toString().padStart(2, "0"),
          slug,
          name: name.toUpperCase(),
          description: `User-defined community collection curated for ${name}.`,
          curationNote: "Community generated category with uploaded reference cards.",
          count: 0,
          isCustom: true,
        });
        index++;
      }
    });

    return list;
  }, [templates, customCategories]);

  // Compute category data with uploaded reference cards prioritized
  const processedCategories = useMemo(() => {
    return allCategories.map((cat) => {
      const matchingTemplates = templates.filter((t) => matchesCategory(t, cat));

      // Separate into uploaded reference cards and standard catalog templates
      const uploadedCards = matchingTemplates.filter(isUploadedReference);
      const standardCards = matchingTemplates.filter((t) => !isUploadedReference(t));

      // Prioritize uploaded reference cards first, then fill with standard cards
      const prioritizedPreviews = [...uploadedCards, ...standardCards];

      return {
        cat,
        uploadedCount: uploadedCards.length,
        totalItems: cat.isCustom
          ? matchingTemplates.length
          : cat.count + uploadedCards.length,
        previews: prioritizedPreviews.slice(0, 3),
        hasUploadedRefs: uploadedCards.length > 0,
      };
    });
  }, [allCategories, templates]);

  // Filter categories if user toggles "WITH UPLOADED REFS"
  const visibleCategories = useMemo(() => {
    if (filterMode === "has_uploads") {
      return processedCategories.filter((item) => item.hasUploadedRefs);
    }
    return processedCategories;
  }, [processedCategories, filterMode]);

  const totalCommunityUploads = useMemo(() => {
    return templates.filter(isUploadedReference).length;
  }, [templates]);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <FolderGit2 className="w-3 h-3 text-black" />
            CATEGORIES ({allCategories.length.toString().padStart(2, "0")} TAXONOMIES)
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black flex items-center gap-3">
            CATEGORY INDEX.
          </h1>
          <p className="font-body text-xs text-[#666666] max-w-xl">
            Explore curated meme taxonomy archives with real-time community uploaded card references and suggestions ready for the canvas editor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Upload Reference CTA */}
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-[#E11D48] font-mono-code text-xs font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>+ UPLOAD REFERENCE</span>
          </Link>

          {/* Uploaded References Counter Pill */}
          {mounted && totalCommunityUploads > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFF1F2] border border-[#E11D48] text-[#E11D48] font-mono-code text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{totalCommunityUploads} UPLOADED REFS LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter / Mode Bar */}
      <div className="px-6 sm:px-8 py-2.5 bg-white border-b border-black flex items-center justify-between gap-4 font-mono-code text-xs overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-[#777777] uppercase text-[11px] font-bold flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-black" /> VIEW FILTER:
          </span>
          <button
            onClick={() => setFilterMode("all")}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-colors ${
              filterMode === "all"
                ? "bg-black text-white"
                : "bg-[#FAF9F5] text-black border border-black hover:bg-white"
            }`}
          >
            ALL TAXONOMIES ({processedCategories.length})
          </button>
          <button
            onClick={() => setFilterMode("has_uploads")}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-colors flex items-center gap-1 ${
              filterMode === "has_uploads"
                ? "bg-[#E11D48] text-white"
                : "bg-[#FAF9F5] text-black border border-black hover:bg-white"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            WITH UPLOADED REFS ({processedCategories.filter((c) => c.hasUploadedRefs).length})
          </button>
        </div>

        <span className="text-[#777777] text-[11px] hidden sm:inline">
          SHOWING FIRST 3 REFERENCES PER CATEGORY
        </span>
      </div>

      {/* Categories Grid */}
      <div className="divide-y divide-black bg-[#FAF9F5]">
        {visibleCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="font-mono-code text-xs text-[#777777] uppercase">
              NO CATEGORIES MATCH THIS FILTER
            </p>
            <button
              onClick={() => setFilterMode("all")}
              className="px-4 py-2 bg-black text-white font-mono-code text-xs font-bold uppercase"
            >
              RESET FILTER
            </button>
          </div>
        ) : (
          visibleCategories.map(({ cat, uploadedCount, totalItems, previews, hasUploadedRefs }) => {
            const uploadHref = `/upload?category=${encodeURIComponent(cat.id)}`;
            const archiveHref = `/cards?category=${encodeURIComponent(cat.id)}`;

            return (
              <div
                key={cat.id}
                className="p-6 sm:p-8 bg-white hover:bg-[#FAF9F5] transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Category Info (Left column) */}
                  <div className="space-y-2 max-w-md">
                    <div className="flex flex-wrap items-center gap-2 font-mono-code text-xs">
                      <span className="px-1.5 py-0.5 bg-black text-white font-bold text-[10px]">
                        [{cat.number}]
                      </span>
                      <span className="text-[#777777] uppercase text-[11px]">
                        {totalItems.toLocaleString()} ITEMS
                      </span>

                      {/* Highlight Badge if uploaded references exist */}
                      {hasUploadedRefs && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#FFF1F2] border border-[#E11D48] text-[#E11D48] font-bold text-[10px] uppercase">
                          <Sparkles className="w-2.5 h-2.5" />
                          {uploadedCount} UPLOADED {uploadedCount === 1 ? "REF" : "REFS"}
                        </span>
                      )}

                      {cat.isCustom && (
                        <span className="px-1.5 py-0.5 bg-amber-100 border border-amber-600 text-amber-900 font-bold text-[10px] uppercase">
                          COMMUNITY CREATED
                        </span>
                      )}
                    </div>

                    <h2 className="font-display font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-black">
                      {cat.name}
                    </h2>

                    <p className="font-body text-xs text-[#666666]">
                      {cat.description}
                    </p>

                    {/* Action Links */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 font-mono-code text-xs font-bold uppercase">
                      <Link
                        href={archiveHref}
                        className="inline-flex items-center gap-1.5 text-black hover:text-[#E11D48] hover:underline"
                      >
                        VIEW ARCHIVE <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      <span className="text-black/30">/</span>

                      <Link
                        href={uploadHref}
                        className="inline-flex items-center gap-1 text-[#E11D48] hover:underline"
                        title="Upload a new card reference into this category"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        + UPLOAD REFERENCE
                      </Link>
                    </div>
                  </div>

                  {/* Sample Previews / Reference Cards (Right column) */}
                  <div className="flex-1 max-w-xl">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {previews.map((item) => {
                        const isUploaded = isUploadedReference(item);

                        return (
                          <Link
                            key={item.id}
                            href={`/edit/${encodeURIComponent(item.slug || item.id)}`}
                            className={`group relative border bg-[#FAF9F5] hover:bg-white p-2 flex flex-col justify-between transition-all hover:translate-y-[-2px] ${
                              isUploaded
                                ? "border-[#E11D48] shadow-[2px_2px_0px_0px_rgba(225,29,72,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(225,29,72,1)]"
                                : "border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                            }`}
                          >
                            {/* Card Image Container */}
                            <div className="relative aspect-[4/3] bg-white border border-black/15 p-1.5 flex items-center justify-center mb-1.5 overflow-hidden">
                              <img
                                src={item.svgDataUri}
                                alt={item.title}
                                className="max-h-full max-w-full object-contain"
                                loading="lazy"
                              />

                              {/* Reference Suggestion Tag Badge */}
                              <div className="absolute top-1 left-1">
                                {isUploaded ? (
                                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-[#E11D48] text-white text-[8px] font-mono-code font-bold tracking-tight uppercase shadow-sm">
                                    <Sparkles className="w-2 h-2" /> UPLOAD REF
                                  </span>
                                ) : (
                                  <span className="px-1 py-0.5 bg-black/80 text-white text-[8px] font-mono-code font-bold uppercase">
                                    CANON
                                  </span>
                                )}
                              </div>

                              {/* Hover Quick Cue */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                                <span className="font-mono-code text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                                  USE AS REF <ArrowUpRight className="w-3 h-3 text-[#E11D48]" />
                                </span>
                              </div>
                            </div>

                            {/* Card Title & Meta */}
                            <div className="space-y-0.5">
                              <div
                                className={`font-display font-bold text-[11px] uppercase truncate transition-colors ${
                                  isUploaded
                                    ? "text-black group-hover:text-[#E11D48]"
                                    : "text-black group-hover:text-[#E11D48]"
                                }`}
                              >
                                {item.title}
                              </div>

                              <div className="flex items-center justify-between font-mono-code text-[9px] text-[#777777]">
                                <span className="truncate">
                                  {isUploaded
                                    ? item.authorEmail
                                      ? `@${item.authorEmail.split("@")[0]}`
                                      : "COMMUNITY REF"
                                    : item.formatLabel || "CLASSIC"}
                                </span>
                                {isUploaded && (
                                  <span className="text-[#E11D48] font-bold shrink-0">
                                    ★ SUGGESTION
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}

                      {/* If category has fewer than 3 cards, render an invitation to upload card reference */}
                      {previews.length < 3 && (
                        <Link
                          href={uploadHref}
                          className="border border-dashed border-black/40 hover:border-[#E11D48] bg-[#FAF9F5] hover:bg-[#FFF1F2] p-2 flex flex-col items-center justify-center text-center transition-colors min-h-[110px]"
                        >
                          <UploadCloud className="w-5 h-5 text-[#888888] mb-1 group-hover:text-[#E11D48]" />
                          <span className="font-mono-code text-[10px] font-bold text-black uppercase">
                            + ADD REF
                          </span>
                          <span className="font-mono-code text-[8px] text-[#777777] uppercase">
                            FOR THIS CATEGORY
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
