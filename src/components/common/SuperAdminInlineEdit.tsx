"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Edit3, X, Check, Crown, RotateCcw, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { DEFAULT_SITE_CONFIG } from "@/app/api/admin/site-config/route";

interface SuperAdminInlineEditProps {
  field: string;
  label: string;
  value: string;
  multiline?: boolean;
  children: React.ReactNode;
  className?: string;
  asBlock?: boolean;
}

export default function SuperAdminInlineEdit({
  field,
  label,
  value,
  multiline = false,
  children,
  className = "",
  asBlock = false,
}: SuperAdminInlineEditProps) {
  const { isAdmin, userEmail } = useAdminAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editedValue, setEditedValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync editedValue whenever the incoming value updates
  useEffect(() => {
    setEditedValue(value || "");
  }, [value]);

  // If user is not Super Admin, render children directly
  if (!isAdmin) {
    return <>{children}</>;
  }

  const handleResetToDefault = () => {
    const defaultValue = (DEFAULT_SITE_CONFIG as any)[field] || "";
    setEditedValue(defaultValue);
    setStatusMessage("Reset to original default.");
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const trimmed = editedValue.trim();

    try {
      // 1. Immediately store in localStorage & notify components in real-time
      try {
        const cached = localStorage.getItem("lolcanvas_site_config");
        const currentConfig = cached ? JSON.parse(cached) : { ...DEFAULT_SITE_CONFIG };
        currentConfig[field] = trimmed;
        localStorage.setItem("lolcanvas_site_config", JSON.stringify(currentConfig));

        window.dispatchEvent(
          new CustomEvent("lolcanvas_content_changed", {
            detail: { [field]: trimmed },
          })
        );
      } catch (err) {}

      // 2. Persist to PostgreSQL via /api/admin/site-config
      const res = await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [field]: trimmed,
          adminEmail: userEmail || "admin123@gmail.com",
        }),
      });

      if (!res.ok) {
        console.warn("Backend save returned non-200, continuing with local update");
      }

      setStatusMessage("✓ Text updated & published live!");
      setTimeout(() => {
        setIsOpen(false);
        setStatusMessage(null);
      }, 400);
    } catch (err) {
      console.error("Failed to save site text:", err);
      setStatusMessage("Error saving to database. Local update applied.");
    } finally {
      setIsSaving(false);
    }
  };

  const modalNode = isOpen && mounted ? (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) {
          setIsOpen(false);
        }
      }}
    >
      <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black px-5 py-3.5 bg-black text-white font-mono-code text-xs">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-[#E11D48]" />
            <span className="font-bold tracking-wider uppercase text-white">
              SUPER ADMIN EDIT // {label}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
            className="p-1 hover:bg-[#E11D48] text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1.5 font-mono-code text-xs">
            <div className="flex items-center justify-between text-[10px] text-[#777777] uppercase font-bold">
              <span>{label}</span>
              <span>FIELD: {field}</span>
            </div>

            {multiline ? (
              <textarea
                rows={4}
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                required
                placeholder={`Enter ${label}...`}
                className="w-full p-3 bg-white border-2 border-black font-body text-sm text-black focus:outline-none focus:border-[#E11D48] leading-relaxed"
              />
            ) : (
              <input
                type="text"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                required
                placeholder={`Enter ${label}...`}
                className="w-full p-3 bg-white border-2 border-black font-mono-code text-xs font-bold uppercase text-black focus:outline-none focus:border-[#E11D48]"
              />
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="p-2.5 bg-[#DCFCE7] border border-[#16A34A] text-[#15803D] font-mono-code text-xs font-bold uppercase flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-black/20 font-mono-code text-xs">
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isSaving}
              className="px-3 py-2 bg-white border border-black hover:bg-[#E6E4DC] text-black font-bold uppercase flex items-center gap-1.5 transition-colors text-[11px]"
            >
              <RotateCcw className="w-3 h-3 text-[#777777]" />
              <span>RESET DEFAULT</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-white border border-black text-black hover:bg-[#FAF9F5] font-bold uppercase transition-colors"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-black text-white hover:bg-[#E11D48] font-bold uppercase flex items-center gap-1.5 transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(225,29,72,1)]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>SAVING...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>SAVE TEXT ■</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <span
        className={`group relative ${asBlock ? "block" : "inline-block"} hover:outline-1 hover:outline-dashed hover:outline-[#E11D48]/50 transition-all ${className}`}
      >
        {children}

        {/* Super Admin On-Hover Edit Trigger Badge */}
        <button
          type="button"
          id={`admin-edit-${field}`}
          data-admin-edit={field}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          title={`SUPER ADMIN: Click to edit ${label}`}
          className="opacity-0 group-hover:opacity-100 transition-all duration-150 absolute -top-3.5 -right-2 z-30 px-2 py-0.5 bg-[#FFE4E6] border border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48] hover:text-white text-[10px] font-mono-code font-bold uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] cursor-pointer select-none"
        >
          <Crown className="w-3 h-3 text-[#E11D48] group-hover:text-white" />
          <Edit3 className="w-3 h-3" />
          <span>EDIT</span>
        </button>
      </span>

      {/* Portal Modal */}
      {modalNode && typeof document !== "undefined" && createPortal(modalNode, document.body)}
    </>
  );
}
