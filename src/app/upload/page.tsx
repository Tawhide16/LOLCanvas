"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { FormatType } from "@/types";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("01");
  const [format, setFormat] = useState<FormatType>("classic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedItem, setSubmittedItem] = useState<{ id: string; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload JPG, PNG, WebP, or SVG.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedItem({
        id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
        title: title.trim().toUpperCase(),
      });
    }, 900);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <UploadCloud className="w-3 h-3 text-[#E11D48]" />
            INGESTION DESK
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black">
            SUBMIT TEMPLATE.
          </h1>
        </div>
        <span className="font-mono-code text-xs text-[#555555] hidden sm:inline">
          WATERMARK-FREE ARCHIVE
        </span>
      </div>

      {submittedItem ? (
        <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-[#10B981] text-white flex items-center justify-center border-2 border-black">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="font-mono-code text-xs text-[#777777] uppercase">
            {submittedItem.id} LOGGED
          </span>
          <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-black">
            {submittedItem.title}
          </h2>
          <p className="font-body text-xs text-[#555555]">
            Template verified and queued for archive catalog publication.
          </p>
          <div className="flex gap-3 pt-2 font-mono-code text-xs">
            <Link
              href="/cards"
              className="px-5 py-2.5 bg-black text-white hover:bg-[#333333] uppercase font-bold"
            >
              BROWSE CATALOG
            </Link>
            <button
              onClick={() => {
                setSubmittedItem(null);
                setFile(null);
                setPreviewUrl(null);
                setTitle("");
              }}
              className="px-5 py-2.5 bg-white border border-black hover:bg-[#F6F5EE] uppercase font-bold"
            >
              SUBMIT ANOTHER
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black">
          {/* Dropzone */}
          <div className="lg:col-span-6 p-6 sm:p-10 bg-white space-y-4">
            <span className="font-mono-code text-[11px] text-[#777777] uppercase font-bold block">
              RAW TEMPLATE IMAGE
            </span>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-black/40 hover:border-black p-8 text-center bg-[#FAF9F5] hover:bg-[#F6F5EE] transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[280px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[200px] object-contain border border-black bg-white p-1"
                  />
                  <span className="text-[11px] font-mono-code text-[#E11D48] underline block">
                    CLICK TO REPLACE
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-black mx-auto" />
                  <span className="font-mono-code text-xs font-bold text-black uppercase block">
                    DRAG & DROP IMAGE OR CLICK
                  </span>
                  <span className="font-mono-code text-[10px] text-[#888888] block">
                    PNG, JPG, WebP, SVG
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-6 p-6 sm:p-10 space-y-5 bg-[#FAF9F5]">
            <div className="space-y-1.5 font-mono-code text-xs">
              <label className="text-[10px] text-[#777777] uppercase font-bold">
                TEMPLATE TITLE *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.G. 'CONFUSED CAT DINNER'..."
                className="w-full p-2.5 bg-white border border-black text-xs font-bold text-black uppercase focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono-code text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  CATEGORY
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2 bg-white border border-black uppercase text-black focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      [{cat.number}] {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  FORMAT
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as FormatType)}
                  className="w-full p-2 bg-white border border-black uppercase text-black focus:outline-none"
                >
                  <option value="classic">CLASSIC</option>
                  <option value="multi-panel">MULTI-PANEL</option>
                  <option value="tweet">TWEET / BOX</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="w-full py-3.5 bg-black text-white hover:bg-[#333333] font-mono-code text-xs uppercase font-bold tracking-wider transition-all hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-40 shadow-[2px_2px_0px_0px_rgba(225,29,72,1)]"
            >
              {isSubmitting ? "PROCESSING..." : "SUBMIT TO COMMONS ■"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
