"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import SuperAdminInlineEdit from "@/components/common/SuperAdminInlineEdit";

export default function HeroBanner() {
  const { content } = useSiteContent();

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

            {/* Impactful Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl tracking-tight leading-[0.95] text-black">
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

            {/* Clean, Short Subtitle */}
            <SuperAdminInlineEdit
              field="heroSubtitle"
              label="Hero Subtitle Description"
              value={content.heroSubtitle}
              multiline
              asBlock
            >
              <p className="font-body text-base sm:text-lg text-[#555555] max-w-lg leading-relaxed">
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
          <div className="p-6 sm:p-8 space-y-5 bg-[#FAF9F5]">
            <div className="flex items-center justify-between text-xs font-mono-code flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#10B981]/10 border border-[#10B981] text-[#065F46] font-bold text-[10px] tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                NO LOGIN NEEDED — 100% FREE CANVAS
              </div>
              <span className="inline-flex items-center gap-1.5 text-black font-bold text-[11px]">
                <span className="w-2 h-2 bg-[#10B981]"></span>
                ENGINE READY
              </span>
            </div>

            {/* Primary Action Buttons with Micro-Animations */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/edit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-4 bg-black text-white hover:bg-[#222222] font-mono-code text-xs uppercase tracking-wider font-bold transition-all shadow-[3px_3px_0px_0px_rgba(225,29,72,1)] hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                OPEN CANVAS EDITOR ■
              </Link>
              <Link
                href="/cards"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 bg-white border border-black text-black hover:bg-[#F6F5EE] font-mono-code text-xs uppercase tracking-wider font-semibold transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                BROWSE ARCHIVE →
              </Link>
            </div>

            {/* 5-Second Quick Start Row */}
            <div className="pt-2 space-y-2 border-t border-black/15">
              <div className="flex items-center justify-between text-[10px] font-mono-code text-[#666666] uppercase">
                <span>QUICK START IN 5 SECONDS:</span>
                <span className="text-[#E11D48] font-bold">1-CLICK REMIX →</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href="/edit"
                  className="px-2.5 py-1 bg-white border border-black hover:bg-black hover:text-white text-[11px] font-mono-code font-bold uppercase transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  ⚡ BLANK
                </Link>
                <Link
                  href="/edit/drake-hotline"
                  className="px-2.5 py-1 bg-white border border-black hover:bg-black hover:text-white text-[11px] font-mono-code font-bold uppercase transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  DRAKE
                </Link>
                <Link
                  href="/edit/distracted-bf"
                  className="px-2.5 py-1 bg-white border border-black hover:bg-black hover:text-white text-[11px] font-mono-code font-bold uppercase transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  DISTRACTED BF
                </Link>
                <Link
                  href="/edit/two-buttons"
                  className="px-2.5 py-1 bg-white border border-black hover:bg-black hover:text-white text-[11px] font-mono-code font-bold uppercase transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  TWO BUTTONS
                </Link>
                <Link
                  href="/edit/change-my-mind"
                  className="px-2.5 py-1 bg-white border border-black hover:bg-black hover:text-white text-[11px] font-mono-code font-bold uppercase transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  CHANGE MY MIND
                </Link>
              </div>
            </div>
          </div>

          {/* Visual Interactive Live Meme Studio Preview */}
          <div className="p-5 sm:p-6 bg-[#0E0E0E] text-white flex flex-col justify-between space-y-3.5 flex-1 border-t border-black group">
            {/* Studio Toolbar Header */}
            <div className="flex items-center justify-between font-mono-code text-[11px] text-[#888888] border-b border-[#222222] pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span className="text-white font-bold ml-1">CANVAS PREVIEW // 1080×1080</span>
              </div>
              <span className="text-[#10B981] font-bold">WATERMARK: 0%</span>
            </div>

            {/* Interactive Visual Canvas Mockup */}
            <Link
              href="/edit/drake-hotline"
              className="relative block w-full aspect-[16/10] bg-[#1A1A1A] border border-[#333333] shadow-[3px_3px_0px_0px_rgba(225,29,72,0.9)] overflow-hidden transition-all hover:border-white cursor-pointer"
            >
              {/* Visual Split Meme Illustration */}
              <div className="w-full h-full grid grid-cols-2 divide-x divide-black bg-[#EADBC8]">
                {/* Disapproval Panel */}
                <div className="relative p-2.5 flex flex-col justify-between bg-[#F4A261]">
                  <div className="w-8 h-8 rounded-full bg-[#9C6644] border-2 border-black flex items-center justify-center font-bold text-white text-xs">
                    ✕
                  </div>
                  <div className="bg-black/90 text-white px-2 py-1 font-display font-black text-[10px] sm:text-xs uppercase leading-tight tracking-wider text-center border border-white">
                    WATERMARKED MEMES
                  </div>
                </div>
                {/* Approval Panel */}
                <div className="relative p-2.5 flex flex-col justify-between bg-[#E76F51]">
                  <div className="w-8 h-8 rounded-full bg-[#9C6644] border-2 border-black flex items-center justify-center font-bold text-white text-xs">
                    ✓
                  </div>
                  <div className="bg-black/90 text-[#10B981] px-2 py-1 font-display font-black text-[10px] sm:text-xs uppercase leading-tight tracking-wider text-center border border-[#10B981]">
                    LOLCANVAS CLEAN PNG
                  </div>
                </div>
              </div>

              {/* Canvas Selection Bounding Box Mockup */}
              <div className="absolute inset-x-3 bottom-2 border-2 border-dashed border-[#E11D48] pointer-events-none p-1">
                <span className="absolute -top-2.5 left-2 bg-[#E11D48] text-white text-[8px] font-mono-code font-bold px-1 uppercase">
                  ACTIVE TEXT LAYER
                </span>
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-black"></span>
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-black"></span>
              </div>

              {/* Hover Action Badge */}
              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-4 py-2 bg-[#E11D48] text-white font-mono-code text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  CLICK TO REMIX IN CANVAS →
                </span>
              </div>
            </Link>

            {/* Studio Manifesto / Motto Bar */}
            <div className="pt-1 flex items-center justify-between text-[11px] font-mono-code text-[#AAAAAA]">
              <SuperAdminInlineEdit
                field="manifestoQuote"
                label="Studio Manifesto Quote"
                value={content.manifestoQuote}
              >
                <span className="italic truncate max-w-[240px] sm:max-w-none text-[11px]">
                  “{content.manifestoQuote.replace(/^["“]|["”]$/g, "")}”
                </span>
              </SuperAdminInlineEdit>
              <span className="text-[#E11D48] font-bold text-[10px] uppercase">100% CLIENT EXPORT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
