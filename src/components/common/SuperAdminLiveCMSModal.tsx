"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Crown, Sliders, ExternalLink } from "lucide-react";
import WebsiteContentManager from "@/components/admin/WebsiteContentManager";

interface SuperAdminLiveCMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string | null;
}

export default function SuperAdminLiveCMSModal({
  isOpen,
  onClose,
  adminEmail,
}: SuperAdminLiveCMSModalProps) {
  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white border-2 border-black w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] overflow-hidden font-sans">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-black px-4 sm:px-6 py-3.5 bg-black text-white font-mono-code text-xs select-none shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-[#E11D48] animate-pulse"></div>
            <Crown className="w-4 h-4 text-[#E11D48]" />
            <span className="font-extrabold uppercase tracking-wider text-white">
              SUPER ADMIN // LIVE FRONT-END WEBSITE CMS & TYPOGRAPHY
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline font-mono-code text-[11px] text-[#AAAAAA] mr-2">
              Changes apply instantly to the website in background
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-[#222222] hover:bg-[#E11D48] text-white border border-[#444444] transition-colors"
              title="Close CMS modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body containing the WebsiteContentManager */}
        <div className="flex-1 overflow-y-auto">
          <WebsiteContentManager
            adminEmail={adminEmail || undefined}
            onSuccess={() => {
              // Option to keep open or close; user can keep it open while tweaking
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
