"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { X, ExternalLink, Wand2, Download, Tag, Info } from "lucide-react";
import FilterBar from "./FilterBar";
import MemeCard from "./MemeCard";
import { TEMPLATES } from "@/lib/data";
import { Template } from "@/types";

interface TemplateGridProps {
  initialCategory?: string;
  searchQuery?: string;
}

export default function TemplateGrid({
  initialCategory = "all",
  searchQuery = "",
}: TemplateGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("trending");
  const [format, setFormat] = useState("all");
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<Template | null>(null);

  // Filter and sort items
  const filteredTemplates = useMemo(() => {
    let result = [...TEMPLATES];

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((t) => t.categoryId === selectedCategory);
    }

    // Filter by format
    if (format !== "all") {
      result = result.filter((t) => t.format === format);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "trending") {
      result.sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));
    } else if (sortBy === "remixes") {
      result.sort((a, b) => b.remixCount - a.remixCount);
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "alpha") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [selectedCategory, format, searchQuery, sortBy]);

  return (
    <section className="w-full bg-[#FAF9F5]">
      {/* 4-Slot Filter Bar */}
      <FilterBar
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        format={format}
        onFormatChange={setFormat}
        totalResults={filteredTemplates.length}
      />

      {/* Connected Grid (4 cols desktop, 2 cols tablet, 1 col mobile) */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-black bg-[#FAF9F5]">
          {filteredTemplates.map((template) => (
            <MemeCard
              key={template.id}
              template={template}
              onPreview={setActivePreviewTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center border-b border-black font-mono-code space-y-4">
          <div className="text-4xl">∅</div>
          <p className="text-base font-bold uppercase text-black">
            NO ARCHIVE ENTRIES MATCH YOUR CURRENT CRITERIA
          </p>
          <p className="text-xs text-[#666666]">
            Try resetting your filters or search keywords.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setFormat("all");
            }}
            className="px-4 py-2 bg-black text-white text-xs uppercase font-bold"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}

      {/* Quick Inspection Modal */}
      {activePreviewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black px-4 py-3 bg-[#E6E4DC] font-mono-code text-xs">
              <span className="font-bold text-black uppercase">
                {activePreviewTemplate.index} // ARCHIVE SPECIFICATION
              </span>
              <button
                onClick={() => setActivePreviewTemplate(null)}
                className="p-1 hover:bg-black hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="p-6 bg-white border border-black flex items-center justify-center aspect-[16/10] max-h-[320px]">
                <img
                  src={activePreviewTemplate.svgDataUri}
                  alt={activePreviewTemplate.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div>
                <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-black">
                  {activePreviewTemplate.title}
                </h3>
                <p className="font-mono-code text-xs text-[#555555] mt-1">
                  CATEGORY: {activePreviewTemplate.categoryName} • FORMAT: {activePreviewTemplate.formatLabel}
                </p>
              </div>

              {/* Technical Spec Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border border-black divide-x divide-black bg-white font-mono-code text-xs">
                <div className="p-3">
                  <span className="block text-[10px] text-[#777777]">RATIO</span>
                  <strong className="text-black">{activePreviewTemplate.aspectRatio}</strong>
                </div>
                <div className="p-3">
                  <span className="block text-[10px] text-[#777777]">RESOLUTION</span>
                  <strong className="text-black">{activePreviewTemplate.width}×{activePreviewTemplate.height}</strong>
                </div>
                <div className="p-3">
                  <span className="block text-[10px] text-[#777777]">REMIXES</span>
                  <strong className="text-black">{activePreviewTemplate.remixCount.toLocaleString()}</strong>
                </div>
                <div className="p-3">
                  <span className="block text-[10px] text-[#777777]">WATERMARK</span>
                  <strong className="text-[#10B981]">0% CLEAN</strong>
                </div>
              </div>

              {/* Source & Rights */}
              <div className="p-4 bg-[#E6E4DC] border border-black font-mono-code text-xs space-y-1.5">
                <div className="text-[10px] font-bold text-[#555555]">PROVENANCE & RIGHTS:</div>
                <div>SOURCE: {activePreviewTemplate.source}</div>
                <div>LICENSE: {activePreviewTemplate.license}</div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 font-mono-code text-[11px]">
                {activePreviewTemplate.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-white border border-black/30 text-black uppercase"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-black p-4 bg-[#FAF9F5] flex items-center justify-end gap-3 font-mono-code text-xs">
              <button
                onClick={() => setActivePreviewTemplate(null)}
                className="px-4 py-2.5 bg-white border border-black hover:bg-[#E6E4DC] uppercase font-bold"
              >
                CLOSE
              </button>
              <Link
                href={`/edit/${activePreviewTemplate.slug}`}
                className="px-6 py-2.5 bg-black text-white hover:bg-[#333333] uppercase font-bold flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                LAUNCH IN CANVAS EDITOR
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
