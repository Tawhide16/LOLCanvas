import { Suspense } from "react";
import HeroBanner from "@/components/home/HeroBanner";
import TrendingSection from "@/components/home/TrendingSection";
import CollectionSection from "@/components/home/CollectionSection";
import TemplateGrid from "@/components/archive/TemplateGrid";
import SubmissionCallout from "@/components/home/SubmissionCallout";
import { getTemplates } from "@/modules/templates/template.service";

export const instant = false;

async function getInitialTemplates() {
  try {
    const res = await getTemplates({
      category: "all",
      search: "",
      page: 1,
      limit: 60,
    });
    return res?.templates || [];
  } catch (err) {
    console.warn("Could not pre-fetch templates for Home SSR:", err);
    return [];
  }
}

async function HomeDynamicCatalog() {
  const initialTemplates = await getInitialTemplates();

  return (
    <>
      {/* 4.4 Trending Dispatch Strip */}
      <TrendingSection initialTemplates={initialTemplates} />

      {/* 4.4 Category Taxonomy 01-08 */}
      <CollectionSection />

      {/* 4.5 Archive Catalog & 4-Column Connected Grid */}
      <section className="w-full border-b border-black bg-[#FAF9F5]">
        <div className="flex items-center justify-between border-b border-black px-4 sm:px-6 py-2.5 bg-[#FAF9F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-black"></div>
            <h2 className="font-display font-extrabold text-xs sm:text-sm tracking-wider uppercase text-black">
              ARCHIVE CATALOG
            </h2>
          </div>
          <span className="font-mono-code text-[11px] text-[#777777]">
            CONNECTED CATALOG SEAMS
          </span>
        </div>

        <TemplateGrid initialCategory="all" initialTemplates={initialTemplates} />
      </section>
    </>
  );
}

import MemeCardSkeleton from "@/components/archive/MemeCardSkeleton";

function HomeCatalogFallback() {
  return (
    <div className="w-full flex flex-col bg-[#FAF9F5] border-b border-black select-none">
      {/* 1. Trending Strip Skeleton */}
      <div className="border-b border-black bg-[#FAF9F5]">
        <div className="flex items-center justify-between border-b border-black px-4 sm:px-6 py-2.5 bg-[#FAF9F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-[#E11D48] animate-pulse" />
            <div className="h-3.5 w-44 bg-black/15 animate-pulse" />
          </div>
          <div className="h-3 w-28 bg-black/10 animate-pulse hidden sm:block" />
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 space-y-3"
            >
              <div className="w-full aspect-square bg-[#FAF9F5] border border-black/20 flex items-center justify-center animate-pulse">
                <div className="w-6 h-6 border-2 border-black/20 border-t-black animate-spin" />
              </div>
              <div className="h-3 w-3/4 bg-black/15 animate-pulse" />
              <div className="h-6 w-full bg-black/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Taxonomy Strip Skeleton */}
      <div className="border-b border-black bg-[#E6E4DC] p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3.5 w-48 bg-black/20 animate-pulse" />
          <div className="h-3 w-24 bg-black/15 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="p-3 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-2"
            >
              <div className="h-2.5 w-6 bg-[#E11D48]/40 animate-pulse" />
              <div className="h-3 w-16 bg-black/20 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Catalog Header & Filter Bar Skeleton */}
      <div className="border-b border-black px-4 sm:px-6 py-2.5 bg-[#FAF9F5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-black animate-ping" />
          <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-black">
            ARCHIVE CATALOG // STREAMING MEMES...
          </span>
        </div>
        <span className="font-mono-code text-[11px] text-[#777777] hidden sm:inline">
          CONNECTING ARCHIVE NODE
        </span>
      </div>

      {/* 4. Filter Bar Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-black divide-x divide-black bg-white">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 space-y-1.5">
            <div className="h-2 w-16 bg-black/15 animate-pulse" />
            <div className="h-7 w-full bg-[#FAF9F5] border border-black/15 animate-pulse" />
          </div>
        ))}
      </div>

      {/* 5. 8-Card Meme Grid Skeleton */}
      <MemeCardSkeleton count={8} />
    </div>
  );
}

export default function Home() {
  return (
    <div suppressHydrationWarning className="flex flex-col w-full">
      {/* 4.3 Split Hero */}
      <HeroBanner />

      {/* Dynamic streamed catalog wrapped in Suspense */}
      <Suspense fallback={<HomeCatalogFallback />}>
        <HomeDynamicCatalog />
      </Suspense>

      {/* 4.6 Full-Width Black Submission Callout */}
      <SubmissionCallout />
    </div>
  );
}
