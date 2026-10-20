"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crown,
  Palette,
  Edit3,
  X,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { useAdminEditMode } from "@/lib/useAdminEditMode";

interface SuperAdminFloatingBarProps {
  onOpenThemeModal: () => void;
  onOpenCMSModal?: () => void;
}

export default function SuperAdminFloatingBar({
  onOpenThemeModal,
  onOpenCMSModal,
}: SuperAdminFloatingBarProps) {
  const { isAdmin } = useAdminAuth();
  const { isEditMode, toggleEditMode, setEditMode } = useAdminEditMode();
  const [isMinimized, setIsMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isAdmin) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-3 right-3 z-[9998] font-mono-code">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          title="Open Super Admin Controls"
          className="p-2.5 bg-black text-white hover:bg-[#E11D48] border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 text-xs font-bold uppercase transition-all"
        >
          <Crown className="w-4 h-4 text-[#E11D48] bg-white rounded-full p-0.5" />
          <span className="hidden sm:inline">SUPER ADMIN</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Super Admin Controls"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9998] font-mono-code text-xs max-w-[95vw] select-none animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div
        className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-colors ${
          isEditMode
            ? "bg-[#DCFCE7] border-[#15803D]"
            : "bg-[#FAF9F5] border-black"
        }`}
      >
        {/* Crown Badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black text-white font-bold shrink-0">
          <Crown className="w-3.5 h-3.5 text-[#E11D48]" />
          <span className="hidden sm:inline text-[11px] uppercase">SUPER ADMIN</span>
        </div>

        {/* Edit Theme Button */}
        <button
          type="button"
          onClick={onOpenThemeModal}
          className="px-2.5 py-1 bg-white hover:bg-black hover:text-white text-black font-bold uppercase border border-black transition-colors flex items-center gap-1.5 text-[11px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
        >
          <Palette className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>EDIT THEME</span>
        </button>

        {/* Live Site CMS Modal Button (Opens Content & Typography Manager on main page) */}
        {onOpenCMSModal && (
          <button
            type="button"
            onClick={onOpenCMSModal}
            className="px-3 py-1 bg-[#E11D48] hover:bg-black text-white font-bold uppercase border border-black transition-colors flex items-center gap-1.5 text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
            title="Open Live Website Content, Image & Typography Editor on this page"
          >
            <Sliders className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">EDIT ALL CONTENT & SIZES ■</span>
            <span className="sm:hidden">CMS ■</span>
          </button>
        )}

        {/* Inline Edit Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleEditMode}
          className={`px-3 py-1 font-bold uppercase border text-[11px] flex items-center gap-1.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] ${
            isEditMode
              ? "bg-[#15803D] text-white border-[#15803D] hover:bg-[#166534]"
              : "bg-[#FFE4E6] text-[#E11D48] border-[#E11D48] hover:bg-[#E11D48] hover:text-white"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {isEditMode ? "EDIT MODE: ON (ACTIVE)" : "EDIT MODE: OFF"}
          </span>
          <span className="md:hidden">
            {isEditMode ? "EDITING: ON" : "EDIT: OFF"}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isEditMode ? "bg-[#86EFAC] animate-ping" : "bg-[#E11D48]"
            }`}
          />
        </button>

        {/* If Edit Mode is active, show quick exit badge */}
        {isEditMode && (
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className="px-2 py-1 bg-white hover:bg-[#E11D48] hover:text-white text-black font-bold uppercase border border-black transition-colors text-[10px] hidden lg:flex items-center gap-1"
            title="Exit Edit Mode"
          >
            <X className="w-3 h-3" />
            <span>EXIT EDIT</span>
          </button>
        )}

        {/* Link to Admin Dashboard */}
        <Link
          href="/admin"
          className="px-2.5 py-1 bg-white hover:bg-[#E6E4DC] text-black font-bold uppercase border border-black transition-colors flex items-center gap-1 text-[11px] shrink-0"
          title="Open Full Admin Panel"
        >
          <Settings className="w-3 h-3 text-[#777777]" />
          <span className="hidden lg:inline">PANEL</span>
        </Link>

        {/* Minimize Button */}
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="p-1 text-[#777777] hover:text-black transition-colors ml-0.5"
          title="Minimize bar"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
