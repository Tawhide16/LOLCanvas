"use client";

import { useState, useEffect } from "react";
import { Compass, Scale, Crown, Edit3, X, Check, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface AboutContent {
  charterTag: string;
  title: string;
  manifestoHeadline: string;
  manifestoDescription: string;
  corePrinciple: string;
}

const DEFAULT_ABOUT: AboutContent = {
  charterTag: "STUDIO CHARTER",
  title: "STUDIO MANIFESTO.",
  manifestoHeadline: "SWISS PRECISION FOR DIGITAL MEMES.",
  manifestoDescription:
    "Memes are modern culture. LOLCanvas delivers watermark-free templates rendered through a clean architectural grid, fast in-browser vector stages, and instant PNG exports without forced logos or sign-up paywalls.",
  corePrinciple: "GOOD MEMES AREN'T JUST FUNNY. THEY ARE CULTURE.",
};

export default function AboutManifestoSection() {
  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit fields
  const [editHeadline, setEditHeadline] = useState(DEFAULT_ABOUT.manifestoHeadline);
  const [editDesc, setEditDesc] = useState(DEFAULT_ABOUT.manifestoDescription);
  const [editPrinciple, setEditPrinciple] = useState(DEFAULT_ABOUT.corePrinciple);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 1. Read local cache for instant render
    try {
      const cached = localStorage.getItem("lolcanvas_about_content");
      if (cached) {
        const parsed = JSON.parse(cached);
        setContent((prev) => ({ ...prev, ...parsed }));
        setEditHeadline(parsed.manifestoHeadline || DEFAULT_ABOUT.manifestoHeadline);
        setEditDesc(parsed.manifestoDescription || DEFAULT_ABOUT.manifestoDescription);
        setEditPrinciple(parsed.corePrinciple || DEFAULT_ABOUT.corePrinciple);
      }
    } catch (e) {}

    // 2. Fetch persistent content from Database API so ALL ROLES & GUESTS see it!
    fetch("/api/admin/site-config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.aboutContent) {
          setContent((prev) => ({ ...prev, ...data.data.aboutContent }));
          setEditHeadline(data.data.aboutContent.manifestoHeadline || DEFAULT_ABOUT.manifestoHeadline);
          setEditDesc(data.data.aboutContent.manifestoDescription || DEFAULT_ABOUT.manifestoDescription);
          setEditPrinciple(data.data.aboutContent.corePrinciple || DEFAULT_ABOUT.corePrinciple);
          try {
            localStorage.setItem(
              "lolcanvas_about_content",
              JSON.stringify(data.data.aboutContent)
            );
          } catch (e) {}
        }
      })
      .catch(() => {});

    // 3. Evaluate Super Admin status
    const evaluateAdmin = (email: string | null, role?: string | null) => {
      if (!email) return false;
      if (email.toLowerCase() === "admin123@gmail.com") return true;
      if (role === "SUPER_ADMIN" || role === "ADMIN") return true;
      return false;
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setAdminEmail(session.user.email);
        const role = (session.user.app_metadata?.role || session.user.user_metadata?.role) as string;
        setIsAdmin(evaluateAdmin(session.user.email, role));
      } else if (typeof window !== "undefined") {
        try {
          const local = localStorage.getItem("lolcanvas_user");
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed.email) setAdminEmail(parsed.email);
            setIsAdmin(evaluateAdmin(parsed.email, parsed.role));
          }
        } catch (e) {}
      }
    });

    const handleConfigChange = (e: any) => {
      if (e.detail?.aboutContent) {
        setContent((prev) => ({ ...prev, ...e.detail.aboutContent }));
      }
    };
    window.addEventListener("lolcanvas_site_config_changed", handleConfigChange);

    return () => {
      window.removeEventListener("lolcanvas_site_config_changed", handleConfigChange);
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedContent: AboutContent = {
      ...content,
      manifestoHeadline: editHeadline.trim() || DEFAULT_ABOUT.manifestoHeadline,
      manifestoDescription: editDesc.trim() || DEFAULT_ABOUT.manifestoDescription,
      corePrinciple: editPrinciple.trim() || DEFAULT_ABOUT.corePrinciple,
    };

    // 1. Optimistic update
    setContent(updatedContent);
    try {
      localStorage.setItem("lolcanvas_about_content", JSON.stringify(updatedContent));
      window.dispatchEvent(
        new CustomEvent("lolcanvas_site_config_changed", {
          detail: { aboutContent: updatedContent },
        })
      );
    } catch (e) {}

    // 2. Persist to DB API so all roles and users across the internet see it
    try {
      await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aboutContent: updatedContent,
          adminEmail: adminEmail || "admin123@gmail.com",
        }),
      });
    } catch (err) {
      console.warn("Could not save to DB site-config:", err);
    }

    setIsSaving(false);
    setShowEditModal(false);
  };

  const handleReset = () => {
    setEditHeadline(DEFAULT_ABOUT.manifestoHeadline);
    setEditDesc(DEFAULT_ABOUT.manifestoDescription);
    setEditPrinciple(DEFAULT_ABOUT.corePrinciple);
  };

  return (
    <>
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <Compass className="w-3 h-3 text-black" />
            {content.charterTag}
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black">
              {content.title}
            </h1>

            {/* Super Admin Edit Trigger */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="px-2 py-1 bg-[#FFE4E6] border border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48] hover:text-white transition-colors text-[10px] font-mono-code font-bold uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(225,29,72,1)]"
                title="Super Admin: Edit About Page Manifesto"
              >
                <Crown className="w-3 h-3" />
                <span>EDIT MANIFESTO</span>
              </button>
            )}
          </div>
        </div>

        <span className="font-mono-code text-xs text-[#555555] hidden sm:inline">
          CONTENT OVER CHROME
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black border-b border-black">
        {/* Left Column (7 cols): The Manifesto */}
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 bg-white relative group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-black">
                {content.manifestoHeadline}
              </h2>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-[#FFE4E6] text-[#E11D48] border border-[#E11D48] text-[9px] font-mono-code uppercase font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>EDIT</span>
                </button>
              )}
            </div>
            <p className="font-body text-sm text-[#444444] leading-relaxed whitespace-pre-line">
              {content.manifestoDescription}
            </p>
          </div>

          <div className="p-6 bg-black text-white space-y-2 border border-black shadow-[3px_3px_0px_0px_rgba(225,29,72,1)]">
            <span className="font-mono-code text-[10px] uppercase text-[#888888] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#E11D48]" />
              CORE PRINCIPLE
            </span>
            <blockquote className="font-display font-extrabold text-xl uppercase tracking-tight">
              &quot;{content.corePrinciple}&quot;
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

      {/* Super Admin Edit Manifesto Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black px-5 py-3 bg-[#E6E4DC] font-mono-code text-xs">
              <div className="flex items-center gap-2 font-bold uppercase text-black">
                <Crown className="w-4 h-4 text-[#E11D48]" />
                <span>SUPER ADMIN // EDIT ABOUT PAGE CONTENT</span>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isSaving}
                className="p-1 hover:bg-black hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 font-mono-code text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold block">
                  MANIFESTO HEADLINE *
                </label>
                <input
                  type="text"
                  required
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  className="w-full p-2.5 bg-white border border-black font-bold uppercase text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold block">
                  MANIFESTO DESCRIPTION *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 bg-white border border-black text-xs font-body focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold block">
                  CORE PRINCIPLE QUOTE *
                </label>
                <input
                  type="text"
                  required
                  value={editPrinciple}
                  onChange={(e) => setEditPrinciple(e.target.value)}
                  className="w-full p-2.5 bg-white border border-black font-bold uppercase text-xs focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-[#FAF9F5] border border-black/20 text-[11px] text-[#555555]">
                <span className="font-bold text-black uppercase block mb-0.5 text-[10px]">
                  GLOBAL REPLICATION:
                </span>
                Saved content is permanently written to the PostgreSQL database and will instantly be visible to ALL roles (Creators, Curators, Admins, and Visitors).
              </div>

              {/* Actions */}
              <div className="border-t border-black pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-white border border-black hover:bg-[#E6E4DC] text-[11px] font-bold uppercase flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3 text-[#777777]" />
                  <span>RESET DEFAULT</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-3 py-1.5 bg-white border border-black hover:bg-[#E6E4DC] text-[11px] font-bold uppercase"
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-1.5 bg-black text-white hover:bg-[#222222] text-[11px] font-bold uppercase border border-black shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] flex items-center gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>SAVING TO DB...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                        <span>SAVE TO ARCHIVE ■</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
