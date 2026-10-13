"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TEMPLATES } from "@/lib/data";

export default function TrendingSection() {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const trendingTemplates = TEMPLATES.filter((t) => t.trendingRank !== undefined).sort(
    (a, b) => (a.trendingRank || 99) - (b.trendingRank || 99)
  );

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
                {/* Minimal Top Metadata */}
                <div className="flex items-center justify-between border-b border-black/15 px-3 py-1.5 font-mono-code text-[11px] bg-[#FAF9F5]">
                  <span className="font-bold text-[#E11D48]">
                    #{scrollIndex + idx + 1}
                  </span>
                  <span className="text-[#666666] uppercase text-[10px]">
                    {item.categoryName}
                  </span>
                </div>

                {/* Template Preview */}
                <div className="p-4 sm:p-6 flex items-center justify-center bg-white group-hover:bg-[#F6F5EE] transition-colors aspect-[4/3]">
                  <img
                    src={item.svgDataUri}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain border border-black/15 group-hover:border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] group-hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
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
