"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TrendingSectionProps {
  initialTemplates?: any[];
}

export default function TrendingSection({ initialTemplates }: TrendingSectionProps) {
  const [trendingTemplates, setTrendingTemplates] = useState<any[]>(() => {
    if (initialTemplates && initialTemplates.length > 0) return initialTemplates;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lolcanvas_cached_templates");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [scrollIndex, setScrollIndex] = useState(0);
  const [direction, setDirection] = useState(1);

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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black bg-[#FAF9F5]"
          >
            {visibleItems.map((item, idx) => (
              <article
                key={item.id}
                className="group flex flex-col justify-between bg-white hover:bg-[#F6F5EE] transition-colors relative"
              >


                {/* Template Preview - Full bleed meme (Zero whitespace around) */}
                <div className="w-full aspect-square relative overflow-hidden bg-black/5 flex items-center justify-center">
                  <img
                    src={item.svgDataUri}
                    alt={item.title}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Minimal Title & Direct Remix CTA */}
                <div className="p-3 border-t border-black/15 flex items-center justify-between gap-2 bg-[#FAF9F5]">
                  <h3 className="font-display font-bold text-xs text-black uppercase tracking-tight truncate">
                    {item.title}
                  </h3>
                  <Link
                    href={`/edit/${item.slug}`}
                    className="shrink-0 flex items-center gap-1 py-1 px-2.5 bg-black text-white hover:bg-[#333333] transition-all font-mono-code text-[10px] font-bold uppercase tracking-wider"
                  >
                    <Wand2 className="w-2.5 h-2.5" />
                    REMIX
                  </Link>
                </div>
              </article>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

