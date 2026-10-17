"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Edit3, Eye, Check, Trash2, Bookmark } from "lucide-react";
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
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const displayImage = template.svgDataUri || (template as any).previewUrl || template.originalUrl || "";
  const [imageLoaded, setImageLoaded] = useState(() => {
    return typeof displayImage === "string" && displayImage.startsWith("data:");
  });

  // Check if this template is bookmarked/saved by user
  useEffect(() => {
    const checkSavedStatus = () => {
      try {
        const stored = localStorage.getItem("lolcanvas_saved_templates");
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.some(
            (t: any) =>
              (t.id && t.id === template.id) ||
              (t.slug && t.slug === template.slug) ||
              (t.title && t.title.toUpperCase() === template.title.toUpperCase())
          );
          setIsSaved(found);
        } else {
          setIsSaved(false);
        }
      } catch (e) {}
    };

    checkSavedStatus();
    const handleSavedEvent = () => checkSavedStatus();
    window.addEventListener("lolcanvas_saved_templates_changed", handleSavedEvent);
    return () => {
      window.removeEventListener("lolcanvas_saved_templates_changed", handleSavedEvent);
    };
  }, [template.id, template.slug, template.title]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const stored = localStorage.getItem("lolcanvas_saved_templates");
      let list = stored ? JSON.parse(stored) : [];
      const alreadySaved = list.some(
        (t: any) =>
          (t.id && t.id === template.id) ||
          (t.slug && t.slug === template.slug) ||
          (t.title && t.title.toUpperCase() === template.title.toUpperCase())
      );

      if (alreadySaved) {
        list = list.filter(
          (t: any) =>
            t.id !== template.id &&
            t.slug !== template.slug &&
            t.title.toUpperCase() !== template.title.toUpperCase()
        );
        setIsSaved(false);
        setToastMessage("REMOVED");
      } else {
        const itemToSave = {
          id: template.id || template.slug,
          slug: template.slug || template.id,
          title: template.title,
          svgDataUri: displayImage,
          originalUrl: template.originalUrl || displayImage,
          categoryName: template.categoryName || template.categoryId || "CLASSIC",
          categoryId: template.categoryId || "classic",
          format: template.format || "classic",
          downloadCount: template.downloadCount || 0,
          remixCount: template.remixCount || 0,
          authorEmail: template.authorEmail,
          savedAt: new Date().toISOString(),
        };
        list = [itemToSave, ...list];
        setIsSaved(true);
        setToastMessage("SAVED ■");
      }

      localStorage.setItem("lolcanvas_saved_templates", JSON.stringify(list));
      window.dispatchEvent(
        new CustomEvent("lolcanvas_saved_templates_changed", {
          detail: { template, isSaved: !alreadySaved },
        })
      );

      setTimeout(() => setToastMessage(null), 1800);
    } catch (e) {
      console.warn("Could not save template:", e);
    }
  };

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
      {/* 1. Full-bleed Image with Top-Right Save Button */}
      <div className="w-full aspect-square relative overflow-hidden bg-[#FAF9F5] flex items-center justify-center border-b border-black">
        <Link
          href={`/edit/${template.slug || template.id}`}
          onClick={() => {
            try {
              sessionStorage.setItem(`lolcanvas_template_${template.slug || template.id}`, JSON.stringify(template));
              if (template.slug) sessionStorage.setItem(`lolcanvas_template_${template.slug}`, JSON.stringify(template));
              if (template.id) sessionStorage.setItem(`lolcanvas_template_${template.id}`, JSON.stringify(template));
            } catch (e) {}
          }}
          className="w-full h-full relative block cursor-pointer"
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
            src={displayImage}
            alt={template.title}
            loading="eager"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className="w-full h-full object-cover block group-hover:scale-105 transition-all duration-300 relative z-1"
          />
        </Link>

        {/* Save/Bookmark Button (Top-Right Corner) */}
        <button
          type="button"
          onClick={handleToggleSave}
          title={isSaved ? "Saved to Profile (Click to remove)" : "Save template to Profile"}
          aria-label={isSaved ? "Remove saved template" : "Save template to Profile"}
          className={`absolute top-2.5 right-2.5 z-20 p-2 border border-black transition-all duration-150 flex items-center justify-center ${
            isSaved
              ? "bg-[#E11D48] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105"
              : "bg-white/95 text-black hover:bg-black hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105"
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-white text-white" : ""}`} />
        </button>

        {/* Toast Badge on Save */}
        {toastMessage && (
          <div className="absolute top-12 right-2.5 z-30 bg-black text-white px-2 py-0.5 font-mono-code text-[9px] uppercase font-bold border border-black shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] animate-in fade-in duration-100">
            {toastMessage}
          </div>
        )}

        {/* Inspect Preview Button (Top-Left Corner) */}
        {onPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPreview(template);
            }}
            className="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white p-2 hover:bg-[#333333] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10 border border-black"
            title="Inspect"
            aria-label="Inspect template"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

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
