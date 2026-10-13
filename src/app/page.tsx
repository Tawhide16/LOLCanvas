import HeroBanner from "@/components/home/HeroBanner";
import TrendingSection from "@/components/home/TrendingSection";
import CollectionSection from "@/components/home/CollectionSection";
import TemplateGrid from "@/components/archive/TemplateGrid";
import SubmissionCallout from "@/components/home/SubmissionCallout";
import { getTemplates } from "@/modules/templates/template.service";
async function getCachedTemplates() {
  "use cache";
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

export default async function Home() {
  const initialTemplates = await getCachedTemplates();

  return (
    <div suppressHydrationWarning className="flex flex-col w-full">
      {/* 4.3 Split Hero */}
      <HeroBanner />

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

      {/* 4.6 Full-Width Black Submission Callout */}
      <SubmissionCallout />
    </div>
  );
}
