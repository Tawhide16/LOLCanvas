"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Wand2, Edit3, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrendingSectionProps {
  initialTemplates?: any[];
}

export default function TrendingSection({ initialTemplates }: TrendingSectionProps) {
  const [trendingTemplates, setTrendingTemplates] = useState<any[]>(() => {
    if (initialTemplates && initialTemplates.length > 0) return initialTemplates;
    return [];
  });
  const [scrollIndex, setScrollIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Track saved templates
  useEffect(() => {
    const checkSaved = () => {
      try {
        const stored = localStorage.getItem("lolcanvas_saved_templates");
        if (stored) {
          const list = JSON.parse(stored);
          setSavedIds(list.map((t: any) => t.id || t.slug));
        } else {
          setSavedIds([]);
        }
      } catch (e) {}
    };

    checkSaved();
    const handleSavedChange = () => checkSaved();
    window.addEventListener("lolcanvas_saved_templates_changed", handleSavedChange);
    return () => {
      window.removeEventListener("lolcanvas_saved_templates_changed", handleSavedChange);
    };
  }, []);

  const handleToggleSaveItem = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const stored = localStorage.getItem("lolcanvas_saved_templates");
      let list = stored ? JSON.parse(stored) : [];
      const isAlreadySaved = list.some(
        (t: any) => (t.id && t.id === item.id) || (t.slug && t.slug === item.slug)
      );

      if (isAlreadySaved) {
        list = list.filter(
          (t: any) => t.id !== item.id && t.slug !== item.slug
        );
      } else {
        const toSave = {
          id: item.id || item.slug,
          slug: item.slug || item.id,
          title: item.title,
          svgDataUri: item.svgDataUri,
          originalUrl: item.originalUrl || item.svgDataUri,
          categoryName: item.categoryName || item.categoryId || "CLASSIC",
          format: item.format || "classic",
          downloadCount: item.downloadCount || 0,
          remixCount: item.remixCount || 0,
          savedAt: new Date().toISOString(),
        };
        list = [toSave, ...list];
      }

      localStorage.setItem("lolcanvas_saved_templates", JSON.stringify(list));
      setSavedIds(list.map((t: any) => t.id || t.slug));
      window.dispatchEvent(
        new CustomEvent("lolcanvas_saved_templates_changed", {
          detail: { template: item, isSaved: !isAlreadySaved },
        })
      );
    } catch (e) {}
  };

  useEffect(() => {
    // If SSR initialTemplates provided, filter removed templates and avoid duplicate network fetch
    if (initialTemplates && initialTemplates.length > 0) {
      const removedIds: string[] = JSON.parse(localStorage.getItem("lolcanvas_removed_templates") || "[]");
      const filtered = initialTemplates.filter(
        (t: any) => !removedIds.includes(t.id) && !removedIds.includes(t.slug)
      );
      setTrendingTemplates(filtered);
      return;
    }

    // Safely check client cache on mount
    try {
      const cached = localStorage.getItem("lolcanvas_cached_templates");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTrendingTemplates(parsed);
        }
      }
    } catch (e) {}

    async function loadTrending() {
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.templates)) {
            const removedIds: string[] = JSON.parse(localStorage.getItem("lolcanvas_removed_templates") || "[]");
            const filtered = data.data.templates.filter(
              (t: any) => !removedIds.includes(t.id) && !removedIds.includes(t.slug)
            );
            setTrendingTemplates(filtered);
          }
        }
      } catch (err) {}
    }
    loadTrending();
  }, [initialTemplates]);

  if (trendingTemplates.length === 0) return null;

  const visibleCount = 4;
  const maxIndex = Math.max(0, trendingTemplates.length - visibleCount);

  const handlePrev = () => {
    setDirection(-1);
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setScrollIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleItems = trendingTemplates.slice(scrollIndex, scrollIndex + visibleCount);

  return (
    <section className="w-full border-b border-black bg-[#FAF9F5]">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-black px-4 sm:px-6 py-2.5 bg-[#FAF9F5]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 bg-[#E11D48]"></div>
          <h2 className="font-display font-extrabold text-xs sm:text-sm tracking-wider uppercase text-black">
            TRENDING DISPATCH
          </h2>
        </div>

        {/* Previous / Next Controls */}
        <div className="flex items-center gap-2 font-mono-code text-xs">
          <div className="flex items-center border border-black divide-x divide-black bg-white">
            <button
              onClick={handlePrev}
              disabled={scrollIndex === 0}
              className="p-1.5 sm:p-2 hover:bg-[#F6F5EE] disabled:opacity-20 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-black" />
            </button>
            <button
              onClick={handleNext}
              disabled={scrollIndex >= maxIndex}
              className="p-1.5 sm:p-2 hover:bg-[#F6F5EE] disabled:opacity-20 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Animated Horizontal Strip */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={scrollIndex}
            initial={{ opacity: 0, x: direction * 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 25 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-[#FAF9F5]"
          >
            {visibleItems.map((item, idx) => (
              <article
                key={item.id}
                className="group bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative"
              >
                {/* Full-bleed Top Image with Bookmark Button */}
                <div className="w-full aspect-square relative overflow-hidden bg-[#FAF9F5] flex items-center justify-center border-b border-black">
                  <Link
                    href={`/edit/${item.slug}`}
                    onClick={() => {
                      try {
                        sessionStorage.setItem(`lolcanvas_template_${item.slug}`, JSON.stringify(item));
                        if (item.id) sessionStorage.setItem(`lolcanvas_template_${item.id}`, JSON.stringify(item));
                      } catch (e) {}
                    }}
                    className="w-full h-full relative block cursor-pointer"
                  >
                    <img
                      src={item.svgDataUri}
                      alt={item.title}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover block group-hover:scale-105 transition-all duration-300"
                    />
                  </Link>

                  {/* Bookmark Button (Top Right Corner) */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleSaveItem(e, item)}
                    title={
                      savedIds.includes(item.id) || savedIds.includes(item.slug)
                        ? "Saved in Profile (Click to remove)"
                        : "Save template to Profile"
                    }
                    className={`absolute top-2.5 right-2.5 z-20 p-2 border border-black transition-all ${
                      savedIds.includes(item.id) || savedIds.includes(item.slug)
                        ? "bg-[#E11D48] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105"
                        : "bg-white/95 text-black hover:bg-black hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105"
                    }`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        savedIds.includes(item.id) || savedIds.includes(item.slug)
                          ? "fill-white text-white"
                          : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Bottom Content with padding */}
                <div className="p-4 flex flex-col justify-between space-y-3 bg-white">
                  <div className="space-y-1">
                    <h3 className="font-display font-extrabold text-sm uppercase text-black truncate tracking-tight">
                      {item.title}
                    </h3>
                    <div className="font-mono-code text-[10px] text-[#777777] flex items-center justify-between">
                      <span>CREATED: {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "15/10/2026"}</span>
                      <span>{item.downloadCount || item.remixCount || 0} EXPORTS</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/10 font-mono-code text-[11px] font-bold">
                    <Link
                      href={`/edit/${item.slug}`}
                      onClick={() => {
                        try {
                          sessionStorage.setItem(`lolcanvas_template_${item.slug}`, JSON.stringify(item));
                          if (item.id) sessionStorage.setItem(`lolcanvas_template_${item.id}`, JSON.stringify(item));
                        } catch (e) {}
                      }}
                      className="w-full py-1.5 px-2 bg-black text-white hover:bg-[#333333] uppercase text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-[#10B981]" />
                      <span>EDIT IN CANVAS</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

