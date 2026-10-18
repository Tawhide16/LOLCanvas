"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  TrendingUp,
  Search,
  Tag,
  Flame,
  ArrowRight,
  CornerDownLeft,
  Clock,
  Wand2,
  Palette,
  X,
} from "lucide-react";
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
  { label: "REACTION", query: "reaction", icon: Sparkles, color: "#2563EB" },
  { label: "ANIMALS", query: "animals", icon: Tag, color: "#16A34A" },
  { label: "GAMING", query: "gaming", icon: Tag, color: "#9333EA" },
  { label: "CRYPTO", query: "crypto", icon: Tag, color: "#059669" },
  { label: "RELATABLE", query: "relatable", icon: TrendingUp, color: "#D97706" },
  { label: "CLASSIC", query: "classic", icon: Tag, color: "#000000" },
];

const DEFAULT_POPULAR_KEYWORDS = [
  "Cat",
  "Reaction",
  "Trending",
  "Meme",
  "Funny",
  "Crypto",
  "Gaming",
];

// Helper to highlight matching text in search results
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span
            key={i}
            className="bg-[#FFE4E6] text-[#E11D48] font-bold px-0.5 rounded-none underline decoration-[#E11D48]/40"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}

export default function MagicSearchDropdown({
  isOpen,
  onClose,
  searchQuery,
  onSelectQuery,
}: MagicSearchDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [liveTemplates, setLiveTemplates] = useState<Template[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // 1. Load cached templates and recent searches from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedRecents = localStorage.getItem("lolcanvas_recent_searches");
      if (storedRecents) {
        setRecentSearches(JSON.parse(storedRecents));
      }

      const cached = localStorage.getItem("lolcanvas_cached_templates");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLiveTemplates(parsed);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh live templates from API
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/templates?category=all&limit=100");
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data?.templates)) {
            const removedIds: string[] = JSON.parse(
              localStorage.getItem("lolcanvas_removed_templates") || "[]"
            );
            const activeTemplates = json.data.templates.filter(
              (t: Template) => !removedIds.includes(t.id) && !removedIds.includes(t.slug)
            );
            setLiveTemplates(activeTemplates);
            try {
              localStorage.setItem(
                "lolcanvas_cached_templates",
                JSON.stringify(activeTemplates)
              );
            } catch (err) {}
          }
        }
      } catch (err) {}
    }

    fetchTemplates();
  }, [isOpen]);

  // Merge static fallback + live templates deduplicated
  const allTemplates = useMemo(() => {
    const map = new Map<string, Template>();
    for (const t of liveTemplates) {
      if (t.slug) map.set(t.slug, t);
    }
    for (const t of TEMPLATES) {
      if (t.slug && !map.has(t.slug)) {
        map.set(t.slug, t);
      }
    }
    return Array.from(map.values());
  }, [liveTemplates]);

  // Smart suggestions ranked by match quality
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matches: { template: Template; score: number }[] = [];

    for (const t of allTemplates) {
      const titleLower = t.title.toLowerCase();
      const catLower = (t.categoryName || t.categoryId || "").toLowerCase();
      const tags = (t.tags || []).map((x) => x.toLowerCase());

      let score = 0;
      if (titleLower === q) {
        score = 100;
      } else if (titleLower.startsWith(q)) {
        score = 80;
      } else if (titleLower.includes(q)) {
        score = 60;
      } else if (tags.some((tag) => tag === q)) {
        score = 50;
      } else if (tags.some((tag) => tag.includes(q))) {
        score = 40;
      } else if (catLower.includes(q)) {
        score = 30;
      }

      if (score > 0) {
        matches.push({ template: t, score });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 6).map((m) => m.template);
  }, [searchQuery, allTemplates]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery, suggestions.length]);

  // Save to recent searches
  const saveRecentSearch = (query: string) => {
    const clean = query.trim();
    if (!clean) return;
    try {
      const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem("lolcanvas_recent_searches", JSON.stringify(updated));
    } catch (e) {}
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem("lolcanvas_recent_searches");
      setRecentSearches([]);
    } catch (e) {}
  };

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

  // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      } else if (e.key === "Enter" && selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        handleTemplateClick(suggestions[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, suggestions, selectedIndex]);

  if (!isOpen) return null;

  const handleFilterClick = (filterQuery: string) => {
    saveRecentSearch(filterQuery);
    onSelectQuery(filterQuery);
    router.push(`/cards?q=${encodeURIComponent(filterQuery)}`);
    onClose();
  };

  const handleTemplateClick = (template: Template) => {
    saveRecentSearch(template.title);
    router.push(`/edit/${template.slug}`);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1.5 w-[calc(100vw-24px)] sm:w-[560px] max-w-[95vw] bg-[#FAF9F5] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-[100] font-mono-code text-xs animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden"
    >
      {/* Top Header Strip */}
      <div className="bg-[#E6E4DC] px-3.5 py-2 border-b border-black flex items-center justify-between text-[11px] font-bold text-black select-none">
        <span className="flex items-center gap-1.5 uppercase tracking-wider">
          <Wand2 className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>MAGIC FILTER & INSTANT SEARCH</span>
        </span>
        <div className="flex items-center gap-2 text-[10px] text-[#555555]">
          <span className="hidden sm:inline border border-black/30 px-1 bg-white">
            ESC TO CLOSE
          </span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-black p-0.5"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-[68vh] overflow-y-auto divide-y divide-black/20">
        {/* 1. Quick Taxonomy / Magic Filters */}
        <div className="p-3 bg-white space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#777777] uppercase">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E11D48]" />
              INSTANT TAXONOMY CHIPS
            </span>
            <span className="text-[9px] text-[#999999]">{allTemplates.length} TEMPLATES INDEXED</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MAGIC_FILTERS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => handleFilterClick(f.query)}
                  className="px-2.5 py-1 bg-[#FAF9F5] hover:bg-black hover:text-white border border-black text-[10px] uppercase font-bold transition-all flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] group"
                >
                  <Icon className="w-3 h-3 text-[#E11D48] group-hover:text-white transition-colors" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. When User is actively typing: Live Suggestions */}
        {searchQuery.trim().length > 0 ? (
          <div className="p-2 space-y-2 bg-[#FAF9F5]">
            <div className="px-2 pt-1 text-[10px] uppercase font-bold text-[#555555] flex items-center justify-between">
              <span>MATCHING TEMPLATES ({suggestions.length})</span>
              <span className="text-[9px] text-[#E11D48] font-mono-code font-bold">
                CLICK TO OPEN IN CANVAS
              </span>
            </div>

            {suggestions.length > 0 ? (
              <div className="divide-y divide-black/15 border border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {suggestions.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={item.id || item.slug}
                      onClick={() => handleTemplateClick(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-2.5 flex items-center gap-3 cursor-pointer transition-colors group ${
                        isSelected ? "bg-[#FAF9F5]" : "hover:bg-[#FAF9F5]"
                      }`}
                    >
                      {/* Thumbnail Preview */}
                      <div className="w-11 h-11 bg-[#FAF9F5] border border-black shrink-0 overflow-hidden flex items-center justify-center p-0.5 relative shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
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

                      {/* Info & Category */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-black text-xs uppercase truncate group-hover:text-[#E11D48] transition-colors">
                          <HighlightMatch text={item.title} query={searchQuery} />
                        </div>
                        <div className="text-[10px] text-[#777777] uppercase flex items-center gap-1.5 mt-0.5">
                          <span className="bg-[#FAF9F5] px-1 py-0.2 border border-black/20 text-[9px] font-bold text-black">
                            {item.categoryName || item.categoryId || "MEME"}
                          </span>
                          {item.format && (
                            <span className="text-[9px] text-[#666666]">
                              {item.format}
                            </span>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <span className="hidden sm:inline text-[9px] text-[#888888] truncate max-w-[150px]">
                              #{item.tags.slice(0, 2).join(" #")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Direct Editor Trigger */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="hidden sm:inline text-[9px] font-bold bg-[#E6E4DC] px-1.5 py-0.5 border border-black text-black group-hover:bg-[#E11D48] group-hover:text-white transition-colors">
                          EDIT
                        </span>
                        <ArrowRight className="w-4 h-4 text-black/40 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center bg-white border border-black space-y-1.5">
                <span className="text-[11px] text-[#444444] font-medium block">
                  No instant match for &quot;<span className="font-bold text-black">{searchQuery}</span>&quot; in indexed titles.
                </span>
                <button
                  type="button"
                  onClick={() => handleFilterClick(searchQuery)}
                  className="px-3 py-1 bg-[#FAF9F5] hover:bg-black hover:text-white border border-black text-[10px] font-bold uppercase transition-colors inline-flex items-center gap-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Search className="w-3 h-3 text-[#E11D48]" />
                  <span>Search full archive for &quot;{searchQuery}&quot; →</span>
                </button>
              </div>
            )}

            {/* Bottom Complete Archive Search Button */}
            <button
              type="button"
              onClick={() => handleFilterClick(searchQuery)}
              className="w-full mt-2 p-2.5 bg-black text-white hover:bg-[#222222] font-bold uppercase text-[11px] flex items-center justify-between border border-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-[#E11D48]" />
                <span className="truncate">SEARCH ARCHIVE FOR &quot;{searchQuery.toUpperCase()}&quot;</span>
              </span>
              <CornerDownLeft className="w-3.5 h-3.5 text-[#AAAAAA] shrink-0 ml-2" />
            </button>
          </div>
        ) : (
          /* 3. When User is NOT typing: Recent Searches & Viral Searches */
          <div className="p-3 bg-[#FAF9F5] space-y-3">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#777777]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-black" />
                    RECENT SEARCHES
                  </span>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-[9px] text-[#E11D48] hover:underline"
                  >
                    CLEAR
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleFilterClick(item)}
                      className="px-2 py-0.5 bg-white hover:bg-black hover:text-white border border-black/40 hover:border-black text-[10px] uppercase font-medium transition-colors flex items-center gap-1"
                    >
                      <Clock className="w-2.5 h-2.5 text-[#777777]" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Meme Keywords */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#777777] block">
                POPULAR MEME KEYWORDS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_POPULAR_KEYWORDS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleFilterClick(item)}
                    className="px-2.5 py-1 bg-white hover:bg-black hover:text-white border border-black/40 hover:border-black text-[10px] uppercase font-bold transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                  >
                    #{item}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Community Templates Quick Links */}
            {allTemplates.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#777777]">
                  <span>FEATURED CANVASES</span>
                  <span className="text-[9px] text-[#888888]">ONE-CLICK OPEN</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {allTemplates.slice(0, 4).map((tmpl) => (
                    <div
                      key={tmpl.id || tmpl.slug}
                      onClick={() => handleTemplateClick(tmpl)}
                      className="p-1.5 bg-white border border-black/30 hover:border-black flex items-center gap-2 cursor-pointer group transition-colors"
                    >
                      <div className="w-8 h-8 bg-[#FAF9F5] border border-black/20 shrink-0 flex items-center justify-center overflow-hidden">
                        {tmpl.svgDataUri ? (
                          <img
                            src={tmpl.svgDataUri}
                            alt={tmpl.title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Palette className="w-3.5 h-3.5 text-black/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold uppercase truncate group-hover:text-[#E11D48] transition-colors">
                          {tmpl.title}
                        </div>
                        <div className="text-[9px] text-[#888888] uppercase truncate">
                          {tmpl.categoryName || "TEMPLATE"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="px-3 py-1.5 bg-[#FAF9F5] border-t border-black flex items-center justify-between text-[10px] text-[#777777] uppercase">
        <span className="flex items-center gap-1 font-mono-code">
          <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full inline-block"></span>
          REAL-TIME INDEX SYNCHRONIZED
        </span>
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/cards");
          }}
          className="font-bold text-black hover:text-[#E11D48] uppercase flex items-center gap-0.5"
        >
          <span>VIEW FULL CATALOG</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
