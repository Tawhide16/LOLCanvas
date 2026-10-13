"use client";

import { CATEGORIES } from "@/lib/data";

interface FilterBarProps {
  category: string;
  onCategoryChange: (cat: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  format: string;
  onFormatChange: (fmt: string) => void;
  totalResults: number;
}

export default function FilterBar({
  category,
  onCategoryChange,
  sortBy,
  onSortByChange,
  format,
  onFormatChange,
  totalResults,
}: FilterBarProps) {
  return (
    <div className="w-full bg-[#FAF9F5] border-b border-black">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-black font-mono-code text-xs">
        {/* Category Slot */}
        <div className="p-3 bg-white flex flex-col justify-center gap-1">
          <label htmlFor="f-cat" className="text-[10px] text-[#777777] uppercase font-semibold">
            CATEGORY
          </label>
          <select
            id="f-cat"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-black/20 focus:border-black p-1.5 font-mono-code text-xs text-black uppercase focus:outline-none cursor-pointer"
          >
            <option value="all">ALL CATEGORIES</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.number}] {c.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Slot */}
        <div className="p-3 bg-white flex flex-col justify-center gap-1">
          <label htmlFor="f-sort" className="text-[10px] text-[#777777] uppercase font-semibold">
            SORT BY
          </label>
          <select
            id="f-sort"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-black/20 focus:border-black p-1.5 font-mono-code text-xs text-black uppercase focus:outline-none cursor-pointer"
          >
            <option value="trending">TRENDING</option>
            <option value="remixes">MOST REMIXED</option>
            <option value="newest">NEWEST</option>
            <option value="alpha">A – Z</option>
          </select>
        </div>

        {/* Format Slot */}
        <div className="p-3 bg-white flex flex-col justify-center gap-1">
          <label htmlFor="f-fmt" className="text-[10px] text-[#777777] uppercase font-semibold">
            FORMAT
          </label>
          <select
            id="f-fmt"
            value={format}
            onChange={(e) => onFormatChange(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-black/20 focus:border-black p-1.5 font-mono-code text-xs text-black uppercase focus:outline-none cursor-pointer"
          >
            <option value="all">ALL FORMATS</option>
            <option value="classic">CLASSIC TOP/BOTTOM</option>
            <option value="multi-panel">MULTI-PANEL</option>
            <option value="tweet">TWEET / BOX</option>
          </select>
        </div>

        {/* Count Slot */}
        <div className="p-3 bg-[#FAF9F5] flex items-center justify-between">
          <span className="text-[10px] text-[#777777] uppercase font-semibold">
            ARCHIVE TOTAL
          </span>
          <span className="font-display font-extrabold text-xl text-black">
            {totalResults.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
