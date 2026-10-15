"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Edit3, Eye, Check, Trash2 } from "lucide-react";
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
  const [imageLoaded, setImageLoaded] = useState(() => {
    return typeof template?.svgDataUri === "string" && template.svgDataUri.startsWith("data:");
  });

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setDownloading(true);
      let sourceUrl = template.originalUrl || template.svgDataUri;

      if (!template.originalUrl && template.id) {
        try {
          const res = await fetch(`/api/templates?id=${encodeURIComponent(template.id)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.data?.originalUrl) {
              sourceUrl = data.data.originalUrl;
            }
          }
        } catch (fetchErr) {
          console.warn("Could not fetch full-size original, falling back to preview:", fetchErr);
        }
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = sourceUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const realWidth = img.naturalWidth || template.width || 1080;
      const realHeight = img.naturalHeight || template.height || 1080;

      const canvas = document.createElement("canvas");
      canvas.width = realWidth;
      canvas.height = realHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, realWidth, realHeight);

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `lolcanvas-${template.slug}-original.png`;
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

  const isOwner = Boolean(
    authorEmail && currentUserEmail && authorEmail.toLowerCase().trim() === currentUserEmail.toLowerCase().trim()
  );

  const canDelete = Boolean((isAdmin || isOwner) && onDelete);

  const formattedDate = template.createdAt
    ? new Date(template.createdAt).toLocaleDateString("en-GB")
    : "15/10/2026";

  const exportCount = template.downloadCount || template.remixCount || 0;

  return (
    <article className="group bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* 1. Full-bleed Image taking the whole top of the card without padding */}
      <Link
        href={`/edit/${template.slug || template.id}`}
        onClick={() => {
          try {
            sessionStorage.setItem(`lolcanvas_template_${template.slug || template.id}`, JSON.stringify(template));
            if (template.slug) sessionStorage.setItem(`lolcanvas_template_${template.slug}`, JSON.stringify(template));
            if (template.id) sessionStorage.setItem(`lolcanvas_template_${template.id}`, JSON.stringify(template));
          } catch (e) {}
        }}
        className="w-full aspect-square relative overflow-hidden bg-[#FAF9F5] flex items-center justify-center block cursor-pointer border-b border-black"
        title="Open in Canvas Editor"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#FAF9F5] animate-shimmer flex items-center justify-center z-0">
            <div className="w-8 h-8 border border-black/10 flex items-center justify-center text-black/25 font-mono-code text-[9px] font-bold animate-pulse">
              MEME
            </div>
          </div>
        )}
        <img
          src={template.svgDataUri}
          alt={template.title}
          loading="eager"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover block group-hover:scale-105 transition-all duration-300 relative z-1"
        />

        {onPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPreview(template);
            }}
            className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white p-1.5 hover:bg-[#333333] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10"
            title="Inspect"
            aria-label="Inspect template"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </Link>

      {/* 2. Bottom Content Section with padding */}
      <div className="p-4 flex flex-col justify-between space-y-3 bg-white">
        {/* Title and Metadata Line */}
        <div className="space-y-1">
          <h3 className="font-display font-extrabold text-sm uppercase text-black truncate tracking-tight">
            {template.title}
          </h3>
          <div className="font-mono-code text-[10px] text-[#777777] flex items-center justify-between">
            <span>CREATED: {formattedDate}</span>
            <span>{exportCount} EXPORTS</span>
          </div>
        </div>

        {/* Action Buttons (EDIT, PNG, DELETE) */}
        <div
          className={`pt-2 border-t border-black/10 font-mono-code text-[11px] font-bold ${
            canDelete ? "grid grid-cols-3 gap-1.5" : "grid grid-cols-2 gap-2"
          }`}
        >
          <Link
            href={`/edit/${template.slug || template.id}`}
            onClick={() => {
              try {
                sessionStorage.setItem(`lolcanvas_template_${template.slug || template.id}`, JSON.stringify(template));
                if (template.slug) sessionStorage.setItem(`lolcanvas_template_${template.slug}`, JSON.stringify(template));
                if (template.id) sessionStorage.setItem(`lolcanvas_template_${template.id}`, JSON.stringify(template));
              } catch (e) {}
            }}
            className="py-1.5 px-2 bg-black text-white hover:bg-[#333333] uppercase text-center flex items-center justify-center gap-1 transition-colors"
            title="Edit this meme in Canvas Editor"
          >
            <Edit3 className="w-3 h-3 text-[#10B981]" />
            <span>EDIT</span>
          </Link>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="py-1.5 px-2 bg-white border border-black hover:bg-[#FAF9F5] text-black uppercase text-center flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            title="Download clean PNG"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3 h-3 text-[#10B981]" />
                <span>SAVED</span>
              </>
            ) : downloading ? (
              <span>...</span>
            ) : (
              <>
                <Download className="w-3 h-3 text-black" />
                <span>PNG</span>
              </>
            )}
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete!(template.id || template.slug, template.title);
              }}
              className="py-1.5 px-2 bg-white text-[#E11D48] border border-[#E11D48] hover:bg-[#FFF1F2] uppercase text-center flex items-center justify-center gap-1 transition-colors"
              title="Delete this meme card"
            >
              <Trash2 className="w-3 h-3" />
              <span>DELETE</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
