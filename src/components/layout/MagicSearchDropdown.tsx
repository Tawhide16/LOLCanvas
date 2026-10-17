"use client";

import { useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp, Search, Tag, ExternalLink, Flame, ArrowRight, CornerDownLeft } from "lucide-react";
import { TEMPLATES } from "@/lib/data";
import { Template } from "@/types";

interface MagicSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSelectQuery: (query: string) => void;
}

const MAGIC_FILTERS = [
  { label: "TRENDING", query: "trending", icon: Flame, color: "#E11D48" },
  { label: "CLASSIC", query: "classic", icon: Tag, color: "#000000" },
  { label: "REACTION", query: "reaction", icon: Sparkles, color: "#2563EB" },
  { label: "ANIMALS", query: "animals", icon: Tag, color: "#16A34A" },
  { label: "RELATABLE", query: "relatable", icon: TrendingUp, color: "#D97706" },
  { label: "GAMING", query: "gaming", icon: Tag, color: "#9333EA" },
  { label: "CRYPTO", query: "crypto", icon: Tag, color: "#059669" },
];

const POPULAR_SEARCHES = [
  "Drake",
  "Distracted Boyfriend",
  "Two Buttons",
  "Woman Yelling at Cat",
  "Buff Doge",
  "Trade Offer",
  "Galaxy Brain",
];

export default function MagicSearchDropdown({
  isOpen,
  onClose,
  searchQuery,
  onSelectQuery,
}: MagicSearchDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Read templates (including cached custom templates) for live suggestions
  const allTemplates = useMemo(() => {
    let list: Template[] = [...TEMPLATES];
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lolcanvas_cached_templates");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // merge unique by slug
            const existingSlugs = new Set(list.map((t) => t.slug));
            for (const item of parsed) {
              if (!existingSlugs.has(item.slug)) {
                list.push(item);
                existingSlugs.add(item.slug);
              }
            }
          }
        }
      } catch (e) {}
    }
    return list;
  }, [isOpen]);

  // Matching template suggestions
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return allTemplates
      .filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const tagMatch = t.tags?.some((tag) => tag.toLowerCase().includes(q));
        const categoryMatch =
          t.categoryName?.toLowerCase().includes(q) ||
          t.categoryId?.toLowerCase().includes(q);
        return titleMatch || tagMatch || categoryMatch;
      })
      .slice(0, 5);
  }, [searchQuery, allTemplates]);

  if (!isOpen) return null;

  const handleFilterClick = (filterQuery: string) => {
    onSelectQuery(filterQuery);
    router.push(`/cards?q=${encodeURIComponent(filterQuery)}`);
    onClose();
  };

  const handleTemplateClick = (template: Template) => {
    router.push(`/edit/${template.slug}`);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 sm:right-auto sm:w-[480px] mt-1 bg-[#FAF9F5] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden font-mono-code text-xs animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header Bar */}
      <div className="bg-[#E6E4DC] px-3.5 py-2 border-b border-black flex items-center justify-between text-[11px] font-bold text-black">
        <span className="flex items-center gap-1.5 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
          MAGIC FILTER & SMART SUGGESTIONS
        </span>
        <span className="text-[10px] text-[#777777] uppercase hidden sm:inline">
          PRESS ESC TO CLOSE
        </span>
      </div>

      {/* 1. Magic Filter Quick Chips */}
      <div className="p-3 border-b border-black bg-white space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#777777] block">
          QUICK TAXONOMY FILTERS
        </span>
        <div className="flex flex-wrap gap-1.5">
          {MAGIC_FILTERS.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => handleFilterClick(f.query)}
                className="px-2.5 py-1 bg-[#FAF9F5] hover:bg-black hover:text-white border border-black text-[10px] uppercase font-bold transition-all flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
              >
                <Icon className="w-3 h-3 text-[#E11D48]" />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Live Suggestions if typing */}
      {searchQuery.trim().length > 0 ? (
        <div className="p-2 space-y-1 bg-[#FAF9F5]">
          <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#777777] flex items-center justify-between">
            <span>MATCHING TEMPLATES ({suggestions.length})</span>
            <span className="text-[9px] text-[#E11D48]">DIRECT OPEN</span>
          </div>

          {suggestions.length > 0 ? (
            <div className="divide-y divide-black/10 border border-black/20 bg-white">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleTemplateClick(item)}
                  className="p-2 flex items-center gap-3 hover:bg-[#F6F5EE] cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 bg-[#FAF9F5] border border-black shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                    {item.svgDataUri ? (
                      <img
                        src={item.svgDataUri}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Search className="w-4 h-4 text-black/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-black text-xs uppercase truncate group-hover:text-[#E11D48] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-[#777777] uppercase flex items-center gap-2">
                      <span className="bg-[#FAF9F5] px-1 border border-black/15 text-[9px]">
                        {item.categoryName || item.categoryId}
                      </span>
                      {item.format && (
                        <span className="text-[9px] text-[#888888]">
                          {item.format}
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-black/30 group-hover:text-black group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center bg-white border border-black/20 space-y-1">
              <span className="text-[11px] text-[#555555] block">
                No instant match for &quot;{searchQuery}&quot;
              </span>
              <button
                type="button"
                onClick={() => handleFilterClick(searchQuery)}
                className="text-[10px] font-bold text-[#E11D48] underline uppercase"
              >
                Search entire archive anyway →
              </button>
            </div>
          )}

          {/* Full search submit row */}
          <button
            type="button"
            onClick={() => handleFilterClick(searchQuery)}
            className="w-full mt-2 p-2 bg-black text-white hover:bg-[#222222] font-bold uppercase text-[11px] flex items-center justify-between border border-black transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#E11D48]" />
              SEARCH ALL ARCHIVE FOR &quot;{searchQuery.toUpperCase()}&quot;
            </span>
            <CornerDownLeft className="w-3.5 h-3.5 text-[#AAAAAA]" />
          </button>
        </div>
      ) : (
        /* Popular searches when not typing */
        <div className="p-3 bg-[#FAF9F5] space-y-2">
          <span className="text-[10px] uppercase font-bold text-[#777777] block">
            VIRAL SEARCH KEYWORDS
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SEARCHES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleFilterClick(item)}
                className="px-2 py-0.5 bg-white hover:bg-black hover:text-white border border-black/30 hover:border-black text-[10px] uppercase font-medium transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
