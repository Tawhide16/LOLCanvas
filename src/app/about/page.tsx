import Link from "next/link";
import { Compass, Scale } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-[#FAF9F5]">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <Compass className="w-3 h-3 text-black" />
            STUDIO CHARTER
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black">
            STUDIO MANIFESTO.
          </h1>
        </div>

        <span className="font-mono-code text-xs text-[#555555] hidden sm:inline">
          CONTENT OVER CHROME
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black border-b border-black">
        {/* Left Column (7 cols): The Manifesto */}
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 bg-white">
          <div className="space-y-3">
            <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-black">
              SWISS PRECISION FOR DIGITAL MEMES.
            </h2>
            <p className="font-body text-sm text-[#444444] leading-relaxed">
              Memes are modern culture. LOLCanvas delivers watermark-free templates
              rendered through a clean architectural grid, fast in-browser vector stages,
              and instant PNG exports without forced logos or sign-up paywalls.
            </p>
          </div>

          <div className="p-6 bg-black text-white space-y-2 border border-black shadow-[3px_3px_0px_0px_rgba(225,29,72,1)]">
            <span className="font-mono-code text-[10px] uppercase text-[#888888]">
              CORE PRINCIPLE
            </span>
            <blockquote className="font-display font-extrabold text-xl uppercase tracking-tight">
              “GOOD MEMES AREN’T JUST FUNNY. THEY ARE CULTURE.”
            </blockquote>
          </div>
        </div>

        {/* Right Column (5 cols): Architecture */}
        <div className="lg:col-span-5 p-6 sm:p-10 space-y-6 bg-[#FAF9F5]">
          <div className="space-y-3">
            <span className="font-mono-code text-[10px] text-[#777777] uppercase font-bold tracking-widest block">
              TECHNICAL ARCHITECTURE
            </span>
            <div className="border border-black divide-y divide-black bg-white font-mono-code text-xs">
              <div className="p-2.5 flex justify-between">
                <span className="text-[#777777]">STACK</span>
                <strong className="text-black">NEXT.JS 16 + REACT 19</strong>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-[#777777]">CANVAS</span>
                <strong className="text-black">HTML5 2D CONTEXT</strong>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-[#777777]">WATERMARK</span>
                <strong className="text-[#10B981]">0% FORCED</strong>
              </div>
              <div className="p-2.5 flex justify-between">
                <span className="text-[#777777]">EXPORT</span>
                <strong className="text-black">CLIENT-SIDE HI-DPI</strong>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#E6E4DC] border border-black font-mono-code text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-black">
              <Scale className="w-3.5 h-3.5" />
              <span>COMMONS & FAIR USE</span>
            </div>
            <p className="text-[11px] text-[#666666]">
              All templates are published for parody and transformative expression.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
