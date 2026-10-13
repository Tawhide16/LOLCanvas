"use client";

import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroBanner() {
  return (
    <section className="w-full border-b border-black bg-[#FAF9F5]">
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black">
        {/* Left Side (~7/12 width) */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-14 flex flex-col justify-between space-y-8 bg-[#FAF9F5]">
          <div className="space-y-5">
            {/* Minimalist Top Tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E6E4DC] border border-black text-[11px] font-mono-code uppercase tracking-wider text-black font-semibold">
              <span className="w-2 h-2 bg-[#E11D48]"></span>
              OPEN MEME ARCHIVE & CANVAS ENGINE
            </div>

            {/* Impactful Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl tracking-tight leading-[0.95] text-black">
              MEMES THAT
              <br />
              <span className="underline decoration-4 underline-offset-8 decoration-black">
                MAKE NOISE.
              </span>
            </h1>

            {/* Clean, Short Subtitle */}
            <p className="font-body text-base sm:text-lg text-[#555555] max-w-lg leading-relaxed">
              Editorial, watermark-free template archive and in-browser canvas editor.
              Clean PNG exports without forced stamps.
            </p>
          </div>

          {/* Clean Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-black bg-white divide-x divide-black font-mono-code">
            <div className="p-3 sm:p-4 hover:bg-[#F6F5EE] transition-colors">
              <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                TEMPLATES
              </span>
              <span className="font-display font-extrabold text-xl text-black">
                24K+
              </span>
            </div>
            <div className="p-3 sm:p-4 hover:bg-[#F6F5EE] transition-colors">
              <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                WATERMARKS
              </span>
              <span className="font-display font-extrabold text-xl text-[#E11D48]">
                0%
              </span>
            </div>
            <div className="p-3 sm:p-4 hover:bg-[#F6F5EE] transition-colors">
              <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                TAXONOMIES
              </span>
              <span className="font-display font-extrabold text-xl text-black">
                08
              </span>
            </div>
            <div className="p-3 sm:p-4 hover:bg-[#F6F5EE] transition-colors">
              <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                EXPORT
              </span>
              <span className="font-display font-extrabold text-xl text-black">
                LOCAL
              </span>
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

            {/* Primary Action Buttons with Micro-Animations */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/edit/drake-hotline"
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
          </div>

          {/* Minimalist Neo-brutalist Manifesto Panel */}
          <div className="p-6 sm:p-10 bg-black text-white flex flex-col justify-center space-y-2 flex-1">
            <span className="text-[10px] font-mono-code uppercase tracking-widest text-[#888888]">
              STUDIO MANIFESTO
            </span>
            <blockquote className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight leading-snug">
              “GOOD MEMES AREN’T JUST FUNNY. THEY ARE CULTURE.”
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
