import { useState } from "react";
import Link from "next/link";
import { Download, Edit3, Eye, Check, Trash2, Lock } from "lucide-react";
import { Template } from "@/types";

interface MemeCardProps {
  template: Template;
  onPreview?: (template: Template) => void;
  isAdmin?: boolean;
  currentUserEmail?: string | null;
  onDelete?: (id: string, title: string) => void;
  onEdit?: (template: Template) => void;
}

export default function MemeCard({
  template,
  onPreview,
  isAdmin,
  currentUserEmail,
  onDelete,
  onEdit,
}: MemeCardProps) {
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

  const authorEmail =
    template.authorEmail ||
    template.tags?.find((t) => t.startsWith("author:"))?.replace("author:", "") ||
    null;

  const isUploadedCard = Boolean(authorEmail);
  const isOwner = Boolean(
    authorEmail && currentUserEmail && authorEmail.toLowerCase().trim() === currentUserEmail.toLowerCase().trim()
  );

  return (
    <article className="group flex flex-col justify-between bg-white hover:bg-[#F6F5EE] transition-colors border-r border-b border-black">
      {/* Top Metadata Row */}
      <div className="flex items-center justify-between border-b border-black/15 px-3 py-2 font-mono-code text-[11px] bg-[#FAF9F5]">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-black">{template.index}</span>
          {isOwner && (
            <span className="bg-[#DCFCE7] text-[#15803D] px-1 py-0.2 text-[9px] font-bold border border-[#16A34A]/30">
              YOURS
            </span>
          )}
        </div>
        <span className="text-[#E11D48] font-bold text-[10px] tracking-wider uppercase">
          {template.categoryName}
        </span>
      </div>

      {/* Visual Preview - Full bleed meme (Zero whitespace around) */}
      <div className="w-full aspect-square relative overflow-hidden bg-black/5 flex items-center justify-center">
        <img
          src={template.svgDataUri}
          alt={template.title}
          className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-300"
        />

        {onPreview && (
          <button
            onClick={() => onPreview(template)}
            className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white p-1.5 hover:bg-[#333333] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10"
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
          {isUploadedCard ? (
            isOwner ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit?.(template);
                }}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-black text-white hover:bg-[#222222] font-bold uppercase tracking-wider text-center transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                title="Edit your uploaded meme card"
              >
                <Edit3 className="w-3 h-3 text-[#10B981]" />
                EDIT
              </button>
            ) : isAdmin ? (
              <div
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#F5F5F0] border border-black/20 text-[#777777] font-mono-code text-[10px] font-bold uppercase text-center cursor-not-allowed select-none"
                title="Admin Policy: Admins can delete this card, but cannot edit cards uploaded by other creators."
              >
                <Lock className="w-3 h-3 text-[#777777]" />
                <span>NO EDIT</span>
              </div>
            ) : (
              <div
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#F5F5F0] border border-black/20 text-[#777777] font-mono-code text-[10px] font-bold uppercase text-center cursor-not-allowed select-none"
                title="Only the original author can edit this card."
              >
                <Lock className="w-3 h-3 text-[#777777]" />
                <span>LOCKED</span>
              </div>
            )
          ) : (
            <Link
              href={`/edit/${template.slug}`}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-black text-white hover:bg-[#222222] font-bold uppercase tracking-wider text-center transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <Edit3 className="w-3 h-3 text-[#FAF9F5]" />
              EDIT
            </Link>
          )}

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

        {/* Super Admin Single-Click Card Removal */}
        {isAdmin && onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(template.id || template.slug, template.title);
            }}
            className="w-full py-1 bg-[#FFF1F2] border border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48] hover:text-white font-mono-code text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1 shadow-[1px_1px_0px_0px_rgba(225,29,72,1)]"
            title="Super Admin: Delete this card from the website"
          >
            <Trash2 className="w-3 h-3" />
            <span>REMOVE CARD ✕</span>
          </button>
        )}
      </div>
    </article>
  );
}
