"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { X, ExternalLink, Wand2, Download, Tag, Info, Plus, UploadCloud, Trash2, Crown, CheckCircle2, AlertTriangle, Edit3, Lock } from "lucide-react";
import FilterBar from "./FilterBar";
import MemeCard from "./MemeCard";
import MemeCardSkeleton from "./MemeCardSkeleton";
import { TEMPLATES } from "@/lib/data";
import { Template } from "@/types";
import { supabase } from "@/lib/supabase";

interface TemplateGridProps {
  initialCategory?: string;
  searchQuery?: string;
  initialTemplates?: Template[];
}

export default function TemplateGrid({
  initialCategory = "all",
  searchQuery = "",
  initialTemplates = [],
}: TemplateGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("trending");
  const [format, setFormat] = useState("all");
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<Template | null>(null);

  // Dynamic template archive state: Instant initial data from SSR prop or localStorage cache (0ms delay)
  const [templates, setTemplates] = useState<Template[]>(() => {
    if (initialTemplates && initialTemplates.length > 0) return initialTemplates;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lolcanvas_cached_templates");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(() => {
    if (initialTemplates && initialTemplates.length > 0) return false;
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lolcanvas_cached_templates");
        if (cached && JSON.parse(cached).length > 0) return false;
      } catch (e) {}
    }
    return true;
  });

  // Delete card popup modal state
  const [cardToDelete, setCardToDelete] = useState<Template | null>(null);
  const [isDeletingCard, setIsDeletingCard] = useState(false);

  // Edit card modal state (Only creator can edit their card; admin cannot edit)
  const [cardToEdit, setCardToEdit] = useState<Template | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("classic");
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageOriginal, setEditImageOriginal] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Admin upload card modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("classic");
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [newImageOriginal, setNewImageOriginal] = useState<string | null>(null);
  const [isUploadingCard, setIsUploadingCard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check user session & admin status and load live templates
  useEffect(() => {
    const evaluateAdmin = (email: string | null, role?: string | null) => {
      if (!email) return false;
      if (email.toLowerCase() === "admin123@gmail.com") return true;
      if (role === "SUPER_ADMIN" || role === "ADMIN") return true;
      return false;
    };

    // Check Supabase session & local fallback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        const role = session.user.app_metadata?.role || session.user.user_metadata?.role;
        setIsAdmin(evaluateAdmin(session.user.email, role));
      } else if (typeof window !== "undefined") {
        try {
          const local = localStorage.getItem("lolcanvas_user");
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed.email) setCurrentUserEmail(parsed.email);
            setIsAdmin(evaluateAdmin(parsed.email, parsed.role));
          }
        } catch (e) {}
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        const role = session.user.app_metadata?.role || session.user.user_metadata?.role;
        setIsAdmin(evaluateAdmin(session.user.email, role));
      }
    });

    // 2. Fetch live templates from DB (stale-while-revalidate background sync)
    async function loadTemplates() {
      // Only trigger loading state if we have zero cached or initial templates
      if (templates.length === 0) {
        setIsLoadingTemplates(true);
      }
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.templates)) {
            // Filter out any locally deleted template IDs
            const removedIds: string[] = JSON.parse(localStorage.getItem("lolcanvas_removed_templates") || "[]");
            const filtered = data.data.templates.filter(
              (t: any) => !removedIds.includes(t.id) && !removedIds.includes(t.slug)
            );
            setTemplates(filtered);
            try {
              localStorage.setItem("lolcanvas_cached_templates", JSON.stringify(filtered));
            } catch (e) {}

            // Auto-optimize heavy legacy images in the background so the site loads in milliseconds
            const heavyTemplates = filtered.filter(
              (t: any) => t.svgDataUri && t.svgDataUri.length > 250000
            );
            if (heavyTemplates.length > 0) {
              import("@/lib/imageOptimizer").then(({ processImageForWeb }) => {
                heavyTemplates.forEach(async (ht: any) => {
                  try {
                    const optimized = await processImageForWeb(ht.svgDataUri, 720, 0.85);
                    if (optimized.previewDataUri.length < ht.svgDataUri.length) {
                      setTemplates((prev) =>
                        prev.map((item) =>
                          item.id === ht.id
                            ? {
                                ...item,
                                svgDataUri: optimized.previewDataUri,
                                originalUrl: item.originalUrl || item.svgDataUri,
                              }
                            : item
                        )
                      );
                      // Persist lightweight preview and original image to DB
                      fetch("/api/templates", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: ht.id,
                          svgDataUri: optimized.previewDataUri,
                          originalUrl: ht.originalUrl || ht.svgDataUri,
                          authorEmail: ht.authorEmail || undefined,
                          isSystemOptimization: true,
                        }),
                      }).catch(() => {});
                    }
                  } catch (e) {}
                });
              });
            }
          } else {
            setTemplates([]);
          }
        } else {
          setTemplates([]);
        }
      } catch (err) {
        console.warn("Could not load dynamic templates:", err);
        setTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    }

    loadTemplates();
  }, []);

  // Super Admin: Open popup modal to delete specific card
  const handleAdminDeleteCard = (idOrSlug: string, title: string) => {
    const target =
      templates.find((t) => t.id === idOrSlug || t.slug === idOrSlug) ||
      templates.find((t) => t.title.toLowerCase() === title.toLowerCase());

    if (target) {
      setCardToDelete(target);
    } else {
      setCardToDelete({
        id: idOrSlug,
        slug: idOrSlug,
        title: title,
        categoryName: "TEMPLATE",
        svgDataUri: "",
      } as any);
    }
  };

  // Super Admin: Execute confirmed card deletion
  const handleExecuteDeleteCard = async () => {
    if (!cardToDelete) return;
    setIsDeletingCard(true);
    const targetId = cardToDelete.id || cardToDelete.slug;

    try {
      const res = await fetch(`/api/templates?id=${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Track locally removed
        const removedIds: string[] = JSON.parse(localStorage.getItem("lolcanvas_removed_templates") || "[]");
        removedIds.push(targetId);
        if (cardToDelete.slug) removedIds.push(cardToDelete.slug);
        localStorage.setItem("lolcanvas_removed_templates", JSON.stringify(removedIds));

        setTemplates((prev) => {
          const next = prev.filter((t) => t.id !== targetId && t.slug !== targetId && t.slug !== cardToDelete.slug);
          try {
            localStorage.setItem("lolcanvas_cached_templates", JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        setCardToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Failed to delete card: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      alert("Network error removing card");
    } finally {
      setIsDeletingCard(false);
    }
  };

  // Super Admin / Creator: Upload new template card
  const handleAdminUploadCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImagePreview || !newTitle.trim()) return;

    setIsUploadingCard(true);
    try {
      const slug = newTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") + `-${Date.now()}`;
      const creatorEmail = currentUserEmail || "admin123@gmail.com";
      const fullOriginal = newImageOriginal || newImagePreview;

      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim().toUpperCase(),
          slug,
          category: newCategory,
          svgDataUri: newImagePreview, // Ultra-fast lightweight web preview (~40KB-90KB)
          originalUrl: fullOriginal, // Real original uncompressed image for download
          tags: [newCategory, "custom", "superadmin", `author:${creatorEmail}`],
          authorEmail: creatorEmail,
          width: 1080,
          height: 1080,
        }),
      });

      if (res.ok) {
        const newCard: Template = {
          id: slug,
          slug,
          title: newTitle.trim().toUpperCase(),
          index: `№ ${(templates.length + 1).toString().padStart(4, "0")}`,
          categoryId: newCategory,
          categoryName: newCategory.toUpperCase(),
          format: "classic",
          formatLabel: "Classic Single-Panel",
          svgDataUri: newImagePreview,
          originalUrl: fullOriginal,
          width: 1080,
          height: 1080,
          aspectRatio: "1:1",
          source: "SUPER ADMIN UPLOAD",
          license: "PUBLIC DOMAIN (CC0)",
          tags: [newCategory, "custom", `author:${creatorEmail}`],
          defaultTopText: "",
          defaultBottomText: "",
          isWatermarkFree: true,
          trendingRank: 1,
          remixCount: 1200,
          downloadCount: 800,
          createdAt: new Date().toISOString(),
          authorEmail: creatorEmail,
        };

        setTemplates((prev) => {
          const next = [newCard, ...prev];
          try {
            localStorage.setItem("lolcanvas_cached_templates", JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        setShowUploadModal(false);
        setNewTitle("");
        setNewImagePreview(null);
        setNewImageOriginal(null);
      } else {
        alert("Failed to upload template card.");
      }
    } catch (err) {
      alert("Network error uploading template.");
    } finally {
      setIsUploadingCard(false);
    }
  };

  // Creator: Open Edit Card Modal
  const openEditModal = (template: Template) => {
    setCardToEdit(template);
    setEditTitle(template.title);
    setEditCategory(template.categoryId || "classic");
    setEditImagePreview(template.svgDataUri);
    setEditImageOriginal(template.originalUrl || template.svgDataUri);
  };

  // Creator: Execute Card Update (strictly checks that requester is creator)
  const handleSaveCardEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardToEdit || !editTitle.trim()) return;

    setIsSavingEdit(true);
    try {
      const fullOriginal = editImageOriginal || cardToEdit.originalUrl || editImagePreview;
      const res = await fetch("/api/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cardToEdit.id || cardToEdit.slug,
          title: editTitle.trim().toUpperCase(),
          category: editCategory,
          svgDataUri: editImagePreview,
          originalUrl: fullOriginal,
          authorEmail: currentUserEmail,
        }),
      });

      if (res.ok) {
        setTemplates((prev) => {
          const next = prev.map((t) => {
            if (t.id === cardToEdit.id || t.slug === cardToEdit.slug) {
              return {
                ...t,
                title: editTitle.trim().toUpperCase(),
                categoryId: editCategory,
                categoryName: editCategory.toUpperCase(),
                svgDataUri: editImagePreview || t.svgDataUri,
                originalUrl: fullOriginal,
              };
            }
            return t;
          });
          try {
            localStorage.setItem("lolcanvas_cached_templates", JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        setCardToEdit(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(
          `Failed to save edit: ${
            data.message || "Permission denied. Admins can delete cards, but cannot edit cards created by others."
          }`
        );
      }
    } catch (err) {
      alert("Network error updating template card.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filter and sort items
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((t) => t.categoryId === selectedCategory);
    }

    // Filter by format
    if (format !== "all") {
      result = result.filter((t) => t.format === format);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.categoryName.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "trending") {
      result.sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));
    } else if (sortBy === "remixes") {
      result.sort((a, b) => b.remixCount - a.remixCount);
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "alpha") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [templates, selectedCategory, format, searchQuery, sortBy]);

  return (
    <section className="w-full bg-[#FAF9F5]">
      {/* Super Admin Control Strip (Visible ONLY to Admin) */}
      {isAdmin && (
        <div className="bg-[#FFF1F2] border-b border-black p-3 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono-code text-xs">
          <div className="flex items-center gap-2 text-[#E11D48] font-bold uppercase">
            <Crown className="w-4 h-4" />
            <span>SUPER ADMIN MODE: YOU CAN REMOVE ANY CARD OR UPLOAD NEW TEMPLATES</span>
          </div>

          <button
            onClick={() => setShowUploadModal(!showUploadModal)}
            className="px-3.5 py-1.5 bg-[#E11D48] text-white hover:bg-black font-bold uppercase transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showUploadModal ? "CLOSE FORM" : "+ UPLOAD TEMPLATE CARD"}</span>
          </button>
        </div>
      )}

      {/* Admin Upload Card Inline Drawer */}
      {isAdmin && showUploadModal && (
        <form
          onSubmit={handleAdminUploadCard}
          className="bg-white border-b border-black p-6 sm:px-8 space-y-4 max-w-4xl mx-auto my-4 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="font-display font-extrabold text-lg uppercase text-black flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#E11D48]" />
            PUBLISH NEW TEMPLATE CARD TO WEBSITE
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-code text-xs">
            <div>
              <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                TEMPLATE TITLE *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="E.G. SURPRISED CAT"
                className="w-full p-2 bg-[#FAF9F5] border border-black text-xs font-bold uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                CATEGORY *
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2 bg-[#FAF9F5] border border-black text-xs font-bold uppercase focus:outline-none"
              >
                <option value="classic">CLASSIC FORMATS</option>
                <option value="reaction">REACTION & SHOCK</option>
                <option value="relatable">WORK & EVERYDAY</option>
                <option value="modern">BRAINROT & SURREAL</option>
                <option value="crypto">FINANCE & CRYPTO</option>
                <option value="animals">ANIMALS & CHAOS</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                IMAGE FILE *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                required
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const { processImageForWeb } = await import("@/lib/imageOptimizer");
                    const result = await processImageForWeb(file, 720, 0.85);
                    setNewImagePreview(result.previewDataUri);
                    setNewImageOriginal(result.originalDataUri);
                  }
                }}
                className="w-full p-1.5 bg-[#FAF9F5] border border-black text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!newImagePreview || !newTitle.trim() || isUploadingCard}
            className="px-6 py-2.5 bg-black text-white hover:bg-[#333333] font-mono-code text-xs uppercase font-bold transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] disabled:opacity-50"
          >
            {isUploadingCard ? "PUBLISHING..." : "PUBLISH CARD TO ARCHIVE ■"}
          </button>
        </form>
      )}

      {/* 4-Slot Filter Bar */}
      <FilterBar
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        format={format}
        onFormatChange={setFormat}
        totalResults={filteredTemplates.length}
      />

      {/* Connected Grid (4 cols desktop, 2 cols tablet, 1 col mobile) */}
      {isLoadingTemplates ? (
        <MemeCardSkeleton count={8} />
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-black bg-[#FAF9F5]">
          {filteredTemplates.map((template) => (
            <MemeCard
              key={template.id}
              template={template}
              isAdmin={isAdmin}
              currentUserEmail={currentUserEmail}
              onDelete={handleAdminDeleteCard}
              onEdit={openEditModal}
              onPreview={setActivePreviewTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center border-b border-black font-mono-code space-y-4 bg-white">
          <div className="text-4xl">∅</div>
          <p className="text-base font-bold uppercase text-black">
            {templates.length === 0
              ? "NO TEMPLATE CARDS FOUND IN ARCHIVE"
              : "NO ARCHIVE ENTRIES MATCH YOUR CURRENT CRITERIA"}
          </p>
          <p className="text-xs text-[#666666] max-w-md mx-auto">
            {templates.length === 0
              ? "All template cards have been removed. Use the Super Admin panel to upload new template cards to the website."
              : "Try resetting your filters or search keywords."}
          </p>
          {templates.length > 0 && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setFormat("all");
              }}
              className="px-4 py-2 bg-black text-white text-xs uppercase font-bold"
            >
              RESET ALL FILTERS
            </button>
          )}
        </div>
      )}

      {/* Quick Inspection Modal */}
      {activePreviewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black px-4 py-3 bg-[#E6E4DC] font-mono-code text-xs">
              <span className="font-bold text-black uppercase">
                {activePreviewTemplate.index} // ARCHIVE SPECIFICATION
              </span>
              <button
                onClick={() => setActivePreviewTemplate(null)}
                className="p-1 hover:bg-black hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="p-6 bg-white border border-black flex items-center justify-center aspect-[16/10] max-h-[320px]">
                <img
                  src={activePreviewTemplate.svgDataUri}
                  alt={activePreviewTemplate.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div>
                <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-black">
                  {activePreviewTemplate.title}
                </h3>
                <p className="font-mono-code text-xs text-[#555555] mt-1">
                  CATEGORY: {activePreviewTemplate.categoryName} • FORMAT: {activePreviewTemplate.formatLabel}
                </p>
              </div>

              {/* Technical Spec Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border border-black divide-x divide-black bg-white font-mono-code text-xs">
                <div className="p-3">
                  <span className="block text-[10px] text-[#777777]">RATIO</span>
                  <strong className="text-black">{activePreviewTemplate.aspectRatio}</strong>
                </div>
                <div className="p-3">
                  <span className="block text-[10px] text-[#777777]">RESOLUTION</span>
                  <strong className="text-black">{activePreviewTemplate.width}×{activePreviewTemplate.height}</strong>
                </div>
                <div className="p-3">
                  <span className="block text-[10px] text-[#777777]">REMIXES</span>
                  <strong className="text-black">{activePreviewTemplate.remixCount.toLocaleString()}</strong>
                </div>
                <div className="p-3">
                  <span className="block text-[10px] text-[#777777]">WATERMARK</span>
                  <strong className="text-[#10B981]">0% CLEAN</strong>
                </div>
              </div>

              {/* Source & Rights */}
              <div className="p-4 bg-[#E6E4DC] border border-black font-mono-code text-xs space-y-1.5">
                <div className="text-[10px] font-bold text-[#555555]">PROVENANCE & RIGHTS:</div>
                <div>SOURCE: {activePreviewTemplate.source}</div>
                <div>LICENSE: {activePreviewTemplate.license}</div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 font-mono-code text-[11px]">
                {activePreviewTemplate.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-white border border-black/30 text-black uppercase"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-black p-4 bg-[#FAF9F5] flex items-center justify-end gap-3 font-mono-code text-xs">
              <button
                onClick={() => setActivePreviewTemplate(null)}
                className="px-4 py-2.5 bg-white border border-black hover:bg-[#E6E4DC] uppercase font-bold"
              >
                CLOSE
              </button>
              <Link
                href={`/edit/${activePreviewTemplate.slug}`}
                className="px-6 py-2.5 bg-black text-white hover:bg-[#333333] uppercase font-bold flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                LAUNCH IN CANVAS EDITOR
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Delete Confirmation Popup Modal */}
      {cardToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-md shadow-[8px_8px_0px_0px_rgba(225,29,72,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black px-4 py-3 bg-[#FFF1F2] font-mono-code text-xs">
              <div className="flex items-center gap-2 text-[#E11D48] font-bold uppercase">
                <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
                <span>CONFIRM CARD REMOVAL</span>
              </div>
              <button
                onClick={() => setCardToDelete(null)}
                disabled={isDeletingCard}
                className="p-1 hover:bg-black hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Card Summary Card */}
              <div className="flex items-center gap-4 p-3 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-20 h-20 shrink-0 bg-[#FAF9F5] border border-black/20 flex items-center justify-center overflow-hidden p-1">
                  {cardToDelete.svgDataUri ? (
                    <img
                      src={cardToDelete.svgDataUri}
                      alt={cardToDelete.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-mono-code text-[9px] text-[#777777]">NO PREVIEW</span>
                  )}
                </div>
                <div className="space-y-1 overflow-hidden min-w-0">
                  <span className="font-mono-code text-[10px] text-[#E11D48] font-bold uppercase tracking-wider block">
                    {cardToDelete.categoryName || "ARCHIVE CARD"}
                  </span>
                  <h4 className="font-display font-black text-sm uppercase text-black truncate">
                    {cardToDelete.title}
                  </h4>
                  <span className="font-mono-code text-[10px] text-[#777777] block truncate">
                    ID: {cardToDelete.id || cardToDelete.slug}
                  </span>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-3 bg-[#FFF1F2] border border-[#E11D48] font-mono-code text-xs text-black space-y-1">
                <p className="font-bold text-[#E11D48] uppercase flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  PERMANENT DELETION WARNING
                </p>
                <p className="text-[11px] text-[#333333]">
                  Are you sure you want to delete this specific card? It will be removed permanently from the website archive and the Neon PostgreSQL database.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-black p-4 bg-[#FAF9F5] flex items-center justify-end gap-3 font-mono-code text-xs">
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                disabled={isDeletingCard}
                className="px-4 py-2 bg-white border border-black hover:bg-[#E6E4DC] uppercase font-bold transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleExecuteDeleteCard}
                disabled={isDeletingCard}
                className="px-5 py-2 bg-[#E11D48] text-white hover:bg-black uppercase font-bold transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingCard ? "DELETING..." : "YES, DELETE CARD ■"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Edit Card Modal (Strictly for original author; admins cannot edit) */}
      {cardToEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black px-4 py-3 bg-[#E6E4DC] font-mono-code text-xs">
              <div className="flex items-center gap-2 font-bold uppercase text-black">
                <Edit3 className="w-4 h-4 text-[#10B981]" />
                <span>EDIT MEME CARD // {cardToEdit.index || "ARCHIVE"}</span>
              </div>
              <button
                onClick={() => setCardToEdit(null)}
                disabled={isSavingEdit}
                className="p-1 hover:bg-black hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verification Banner */}
            <div className="bg-[#DCFCE7] border-b border-[#16A34A]/30 px-4 py-2 font-mono-code text-[11px] text-[#15803D] flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CREATOR OWNERSHIP VERIFIED
              </span>
              <span className="text-[10px] text-[#166534]">
                {cardToEdit.authorEmail || currentUserEmail || "ORIGINAL AUTHOR"}
              </span>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCardEdit} className="p-6 space-y-4 font-mono-code text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Preview & Replacement */}
                <div>
                  <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                    CARD IMAGE PREVIEW
                  </label>
                  <div className="w-full aspect-square border border-black bg-white flex items-center justify-center overflow-hidden p-1 relative group">
                    {editImagePreview ? (
                      <img
                        src={editImagePreview}
                        alt="Card Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[#777777]">NO IMAGE</span>
                    )}
                  </div>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const { processImageForWeb } = await import("@/lib/imageOptimizer");
                        const result = await processImageForWeb(file, 720, 0.85);
                        setEditImagePreview(result.previewDataUri);
                        setEditImageOriginal(result.originalDataUri);
                      }
                    }}
                    className="w-full mt-2 text-[10px] file:mr-2 file:py-1 file:px-2 file:border file:border-black file:text-[10px] file:bg-white file:font-bold file:cursor-pointer"
                  />
                </div>

                {/* Card Fields */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div>
                    <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                      CARD TITLE *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="CARD TITLE"
                      className="w-full p-2.5 bg-white border border-black font-bold uppercase text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                      CATEGORY *
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full p-2.5 bg-white border border-black font-bold uppercase text-xs focus:outline-none"
                    >
                      <option value="classic">CLASSIC FORMATS</option>
                      <option value="reaction">REACTION & SHOCK</option>
                      <option value="relatable">WORK & EVERYDAY</option>
                      <option value="modern">BRAINROT & SURREAL</option>
                      <option value="crypto">FINANCE & CRYPTO</option>
                      <option value="animals">ANIMALS & CHAOS</option>
                    </select>
                  </div>

                  <div className="p-2.5 bg-[#FAF9F5] border border-black/20 text-[11px] text-[#555555]">
                    <span className="font-bold text-black block mb-0.5 uppercase text-[10px]">
                      OWNERSHIP POLICY:
                    </span>
                    Only you (the original author) can modify this card. Admins have power to remove inappropriate cards from the website, but cannot edit your creations.
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-black pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCardToEdit(null)}
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-white border border-black hover:bg-[#E6E4DC] uppercase font-bold transition-colors disabled:opacity-50"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isSavingEdit || !editTitle.trim()}
                  className="px-6 py-2 bg-black text-white hover:bg-[#222222] uppercase font-bold transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{isSavingEdit ? "SAVING..." : "SAVE CARD CHANGES ■"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
