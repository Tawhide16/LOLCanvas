"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import SuperAdminInlineEdit from "@/components/common/SuperAdminInlineEdit";

export default function HeroBanner() {
  const { content } = useSiteContent();

  // Dynamic Typography Font Sizes
  const getHeroTitleClass = (size?: string) => {
    switch (size) {
      case "5xl":
        return "text-3xl sm:text-4xl md:text-5xl leading-tight";
      case "6xl":
        return "text-3xl sm:text-5xl md:text-6xl leading-[0.98]";
      case "7xl":
        return "text-4xl sm:text-6xl md:text-7xl leading-[0.96]";
      case "9xl":
        return "text-5xl sm:text-7xl md:text-8xl xl:text-9xl leading-[0.9]";
      case "8xl":
      default:
        return "text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl leading-[0.95]";
    }
  };

  const getHeroSubtitleClass = (size?: string) => {
    switch (size) {
      case "xs":
        return "text-xs leading-normal";
      case "sm":
        return "text-xs sm:text-sm leading-relaxed";
      case "base":
        return "text-sm sm:text-base leading-relaxed";
      case "xl":
        return "text-lg sm:text-xl md:text-2xl leading-relaxed";
      case "lg":
      default:
        return "text-base sm:text-lg leading-relaxed";
    }
  };

  const getManifestoQuoteClass = (size?: string) => {
    switch (size) {
      case "xl":
        return "text-lg sm:text-xl";
      case "2xl":
        return "text-xl sm:text-2xl";
      case "4xl":
        return "text-2xl sm:text-4xl";
      case "3xl":
      default:
        return "text-2xl sm:text-3xl";
    }
  };

  return (
    <section className="w-full border-b border-black bg-[#FAF9F5]">
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black">
        {/* Left Side (~7/12 width) */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-14 flex flex-col justify-between space-y-8 bg-[#FAF9F5]">
          <div className="space-y-5">
            {/* Minimalist Top Tag */}
            <div>
              <SuperAdminInlineEdit
                field="heroBadge"
                label="Hero Tagline Badge"
                value={content.heroBadge}
              >
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E6E4DC] border border-black text-[11px] font-mono-code uppercase tracking-wider text-black font-semibold">
                  <span className="w-2 h-2 bg-[#E11D48]"></span>
                  {content.heroBadge}
                </div>
              </SuperAdminInlineEdit>
            </div>

            {/* Impactful Headline with Dynamic Font Size */}
            <h1 className={`font-display font-extrabold tracking-tight text-black ${getHeroTitleClass(content.heroTitleSize)}`}>
              <SuperAdminInlineEdit
                field="heroTitle1"
                label="Hero Headline Line 1"
                value={content.heroTitle1}
              >
                <span>{content.heroTitle1}</span>
              </SuperAdminInlineEdit>
              <br />
              <SuperAdminInlineEdit
                field="heroTitle2"
                label="Hero Headline Line 2 (Accent)"
                value={content.heroTitle2}
              >
                <span className="underline decoration-4 underline-offset-8 decoration-black">
                  {content.heroTitle2}
                </span>
              </SuperAdminInlineEdit>
            </h1>

            {/* Clean, Short Subtitle with Dynamic Font Size */}
            <SuperAdminInlineEdit
              field="heroSubtitle"
              label="Hero Subtitle Description"
              value={content.heroSubtitle}
              multiline
              asBlock
            >
              <p className={`font-body text-[#555555] max-w-lg ${getHeroSubtitleClass(content.heroSubtitleSize)}`}>
                {content.heroSubtitle}
              </p>
            </SuperAdminInlineEdit>
          </div>

          {/* Clean Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-black bg-white divide-x divide-black font-mono-code">
            <div className="p-3 sm:p-4 hover:bg-[#F6F5EE] transition-colors">
              <SuperAdminInlineEdit
                field="heroMetric1Value"
                label="Metric 1 (Templates)"
                value={content.heroMetric1Value}
                asBlock
              >
                <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                  {content.heroMetric1Label}
                </span>
                <span className="font-display font-extrabold text-xl text-black">
                  {content.heroMetric1Value}
                </span>
              </SuperAdminInlineEdit>
            </div>
            <div className="p-3 sm:p-4 hover:bg-[#F6F5EE] transition-colors">
              <SuperAdminInlineEdit
                field="heroMetric2Value"
                label="Metric 2 (Watermarks)"
                value={content.heroMetric2Value}
                asBlock
              >
                <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                  {content.heroMetric2Label}
                </span>
                <span className="font-display font-extrabold text-xl text-[#E11D48]">
                  {content.heroMetric2Value}
                </span>
              </SuperAdminInlineEdit>
            </div>
            <div className="p-3 sm:p-4 hover:bg-[#F6F5EE] transition-colors">
              <SuperAdminInlineEdit
                field="heroMetric3Value"
                label="Metric 3 (Taxonomies)"
                value={content.heroMetric3Value}
                asBlock
              >
                <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                  {content.heroMetric3Label}
                </span>
                <span className="font-display font-extrabold text-xl text-black">
                  {content.heroMetric3Value}
                </span>
              </SuperAdminInlineEdit>
            </div>
            <div className="p-3 sm:p-4 hover:bg-[#F6F5EE] transition-colors">
              <SuperAdminInlineEdit
                field="heroMetric4Value"
                label="Metric 4 (Export Mode)"
                value={content.heroMetric4Value}
                asBlock
              >
                <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                  {content.heroMetric4Label}
                </span>
                <span className="font-display font-extrabold text-xl text-black">
                  {content.heroMetric4Value}
                </span>
              </SuperAdminInlineEdit>
            </div>
          </div>
        </div>

        {/* Right Side (~5/12 width) */}
        <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-black bg-[#FAF9F5]">
          {/* Quick Action Area */}
          <div className="p-6 sm:p-8 space-y-6 bg-[#FAF9F5]">
            <div className="flex items-center justify-between text-xs font-mono-code">
              <span className="text-[#666666]">CANVAS WORKBENCH:</span>
              <span className="inline-flex items-center gap-1.5 text-black font-bold">
                <span className="w-2 h-2 bg-[#10B981]"></span>
                ENGINE READY
              </span>
            </div>

            {/* Optional Super Admin Featured Artwork Image */}
            {content.heroBannerImageUrl && (
              <SuperAdminInlineEdit
                field="heroBannerImageUrl"
                label="Featured Artwork Image URL"
                value={content.heroBannerImageUrl}
                asBlock
              >
                <div className="relative aspect-video w-full border border-black overflow-hidden bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <img
                    src={content.heroBannerImageUrl}
                    alt="Featured Meme Canvas Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black text-white font-mono-code text-[10px] font-bold uppercase tracking-wider">
                    FEATURED WORKBENCH
                  </div>
                </div>
              </SuperAdminInlineEdit>
            )}

            {/* Primary Action Buttons with Micro-Animations */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <SuperAdminInlineEdit
                field="heroButton1Text"
                label="Primary Button Text"
                value={content.heroButton1Text || "OPEN CANVAS EDITOR ■"}
                className="flex-1"
                asBlock
              >
                <Link
                  href={content.heroButton1Url || "/editor"}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-4 bg-black text-white hover:bg-[#222222] font-mono-code text-xs uppercase tracking-wider font-bold transition-all shadow-[3px_3px_0px_0px_rgba(225,29,72,1)] hover:translate-y-[-1px] active:translate-y-[1px]"
                >
                  {content.heroButton1Text || "OPEN CANVAS EDITOR ■"}
                </Link>
              </SuperAdminInlineEdit>

              <SuperAdminInlineEdit
                field="heroButton2Text"
                label="Secondary Button Text"
                value={content.heroButton2Text || "BROWSE ARCHIVE →"}
                className="flex-1"
                asBlock
              >
                <Link
                  href={content.heroButton2Url || "/cards"}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-4 bg-white border border-black text-black hover:bg-[#F6F5EE] font-mono-code text-xs uppercase tracking-wider font-semibold transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                >
                  {content.heroButton2Text || "BROWSE ARCHIVE →"}
                </Link>
              </SuperAdminInlineEdit>
            </div>
          </div>

          {/* Minimalist Neo-brutalist Manifesto Panel with Dynamic Text Size */}
          <div className="p-6 sm:p-10 bg-black text-white flex flex-col justify-center space-y-2 flex-1">
            <SuperAdminInlineEdit
              field="manifestoTag"
              label="Studio Manifesto Tag"
              value={content.manifestoTag}
            >
              <span className="text-[10px] font-mono-code uppercase tracking-widest text-[#888888]">
                {content.manifestoTag}
              </span>
            </SuperAdminInlineEdit>

            <SuperAdminInlineEdit
              field="manifestoQuote"
              label="Studio Manifesto Quote"
              value={content.manifestoQuote}
              multiline
              asBlock
            >
              <blockquote className={`font-display font-extrabold tracking-tight leading-snug ${getManifestoQuoteClass(content.manifestoQuoteSize)}`}>
                “{content.manifestoQuote.replace(/^["“]|["”]$/g, '')}”
              </blockquote>
            </SuperAdminInlineEdit>
          </div>
        </div>
      </div>
    </section>
  );
}
