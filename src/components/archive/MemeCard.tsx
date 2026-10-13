"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Edit3, Eye, Check } from "lucide-react";
import { Template } from "@/types";

interface MemeCardProps {
  template: Template;
  onPreview?: (template: Template) => void;
}

export default function MemeCard({ template, onPreview }: MemeCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setDownloading(true);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = template.svgDataUri;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = template.width;
      canvas.height = template.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `lolcanvas-${template.slug}-clean.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <article className="group flex flex-col justify-between bg-white hover:bg-[#F6F5EE] transition-colors border-r border-b border-black">
      {/* Top Metadata Row */}
      <div className="flex items-center justify-between border-b border-black/15 px-3 py-2 font-mono-code text-[11px] bg-[#FAF9F5]">
        <span className="font-bold text-black">{template.index}</span>
        <span className="text-[#E11D48] font-bold text-[10px] tracking-wider uppercase">
          {template.categoryName}
        </span>
      </div>

      {/* Visual Preview */}
      <div className="p-4 sm:p-6 flex items-center justify-center bg-white group-hover:bg-[#F6F5EE] transition-colors relative min-h-[200px]">
        <div className="w-full aspect-[4/3] relative flex items-center justify-center">
          <img
            src={template.svgDataUri}
            alt={template.title}
            className="max-h-full max-w-full object-contain border border-black/15 group-hover:border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] group-hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>

        {onPreview && (
          <button
            onClick={() => onPreview(template)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white p-1.5 hover:bg-[#333333]"
            title="Inspect"
            aria-label="Inspect template"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Minimal Title & Actions */}
      <div className="p-3 border-t border-black/15 flex flex-col justify-between space-y-2.5 bg-[#FAF9F5]">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xs sm:text-sm text-black uppercase tracking-tight truncate">
            {template.title}
          </h3>
          <span className="font-mono-code text-[10px] text-[#777777] shrink-0 ml-2">
            {(template.remixCount / 1000).toFixed(0)}K
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 font-mono-code text-[11px]">
          <Link
            href={`/edit/${template.slug}`}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-black text-white hover:bg-[#222222] font-bold uppercase tracking-wider text-center transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            <Edit3 className="w-3 h-3 text-[#FAF9F5]" />
            EDIT
          </Link>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white border border-black text-black hover:bg-[#E6E4DC] uppercase tracking-wider text-center transition-all hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50"
            title="Download clean PNG"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3 h-3 text-[#10B981]" />
                SAVED
              </>
            ) : downloading ? (
              <span>...</span>
            ) : (
              <>
                <Download className="w-3 h-3 text-black" />
                PNG
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
