"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TemplateGrid from "@/components/archive/TemplateGrid";
import { Database } from "lucide-react";

function CardsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("q") || "";

  return (
    <div className="flex flex-col w-full">
      {/* Minimal Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <Database className="w-3 h-3 text-[#E11D48]" />
            TEMPLATE REPOSITORY
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black">
            ARCHIVE CATALOG.
          </h1>
        </div>

        <span className="font-mono-code text-xs text-[#555555] hidden sm:inline">
          100% UNMARKED ASSETS
        </span>
      </div>

      {/* Grid with Filters */}
      <TemplateGrid initialCategory={initialCategory} searchQuery={initialSearch} />
    </div>
  );
}

export default function CardsPage() {
  return (
    <Suspense fallback={<div className="p-12 font-mono-code text-xs">LOADING ARCHIVE...</div>}>
      <CardsContent />
    </Suspense>
  );
}
