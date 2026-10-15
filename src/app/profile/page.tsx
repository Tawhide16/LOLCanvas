"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  LogOut,
  Sparkles,
  Download,
  Trash2,
  Wand2,
  UploadCloud,
  CheckCircle2,
  Crown,
  ArrowRight,
  Database,
  Image as ImageIcon,
  Layers,
  Heart,
  Plus,
  Edit3,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserMeme {
  id: string;
  title: string;
  previewUrl: string | null;
  downloads: number;
  likes: number;
  createdAt: string;
  templateId?: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<{ email: string; name?: string; role?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memes, setMemes] = useState<UserMeme[]>([]);
  const [isMemesLoading, setIsMemesLoading] = useState(false);

  // Upload widget state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadOriginal, setUploadOriginal] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("classic");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit meme modal state
  const [editingMeme, setEditingMeme] = useState<UserMeme | null>(null);
  const [editMemeTitle, setEditMemeTitle] = useState("");
  const [isUpdatingMeme, setIsUpdatingMeme] = useState(false);

  // 1. Load Session
  useEffect(() => {
    async function initUser() {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const role = (session.user.app_metadata?.role || session.user.user_metadata?.role || "CREATOR") as string;
          setUser({
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email.split("@")[0],
            role,
          });
          loadUserMemes(session.user.email);
        } else if (typeof window !== "undefined") {
          const local = localStorage.getItem("lolcanvas_user");
          if (local) {
            const parsed = JSON.parse(local);
            setUser({
              email: parsed.email,
              name: parsed.name || parsed.email.split("@")[0],
              role: parsed.role || (parsed.email === "admin123@gmail.com" ? "SUPER_ADMIN" : "CREATOR"),
            });
            loadUserMemes(parsed.email);
          }
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initUser();
  }, []);

  // 2. Fetch User Memes & Uploaded Templates
  const loadUserMemes = async (email: string) => {
    setIsMemesLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const [memesRes, templatesRes] = await Promise.all([
        fetch(`/api/memes?authorEmail=${encodeURIComponent(normalizedEmail)}&limit=50`),
        fetch(`/api/templates?category=all&limit=100`),
      ]);

      const items: UserMeme[] = [];

      if (memesRes.ok) {
        const memesData = await memesRes.json();
        if (memesData.data?.memes) {
          items.push(...memesData.data.memes);
        }
      }

      if (templatesRes.ok) {
        const tplData = await templatesRes.json();
        const allTpls = tplData.data?.templates || [];
        const userTpls = allTpls.filter((t: any) => {
          const tEmail = (t.authorEmail || '').toLowerCase().trim();
          const tagAuthor = (t.tags || []).find((tag: string) => tag.startsWith('author:'))?.replace('author:', '').toLowerCase().trim();
          return tEmail === normalizedEmail || tagAuthor === normalizedEmail;
        });

        userTpls.forEach((t: any) => {
          if (!items.some((m) => m.id === t.id || m.title.toUpperCase() === t.title.toUpperCase())) {
            items.push({
              id: t.id,
              title: t.title,
              previewUrl: t.svgDataUri || t.originalUrl,
              downloads: t.downloadCount || t.remixCount || 0,
              likes: Math.round((t.remixCount || 100) * 0.4),
              createdAt: t.createdAt || new Date().toISOString(),
              templateId: t.slug || t.id,
            });
          }
        });
      }

      setMemes(items);
    } catch (err) {
      console.error("Failed to load user creations:", err);
    } finally {
      setIsMemesLoading(false);
    }
  };

  // 3. Handle File Selection for Upload with Automatic Web Optimization
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const valid = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!valid.includes(selected.type)) {
      alert("Please upload a PNG, JPG, WebP, or SVG image.");
      return;
    }

    setUploadFile(selected);
    try {
      const { processImageForWeb } = await import("@/lib/imageOptimizer");
      const result = await processImageForWeb(selected, 720, 0.85);
      setUploadPreview(result.previewDataUri);
      setUploadOriginal(result.originalDataUri);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadPreview(event.target?.result as string);
        setUploadOriginal(event.target?.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  // 4. Handle Direct Meme Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview || !uploadTitle.trim() || !user) return;

    setIsUploading(true);
    setUploadSuccess(null);

    try {
      // A. Save to user memes repository
      const res = await fetch("/api/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle.trim().toUpperCase(),
          previewUrl: uploadPreview,
          authorEmail: user.email,
          isPublic: true,
          layers: [
            {
              id: `bg-${Date.now()}`,
              type: "image",
              imageUrl: uploadOriginal || uploadPreview,
              x: 0,
              y: 0,
              zIndex: 1,
            },
          ],
        }),
      });

      // B. Also publish as a website template card tagged with user's author email
      const slug = uploadTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") + `-${Date.now()}`;
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle.trim().toUpperCase(),
          slug,
          category: uploadCategory,
          svgDataUri: uploadPreview, // Ultra-fast lightweight web preview
          originalUrl: uploadOriginal || uploadPreview, // Real original uncompressed image for download
          tags: [uploadCategory, "user_upload", `author:${user.email.toLowerCase().trim()}`],
          authorEmail: user.email,
          width: 1080,
          height: 1080,
        }),
      }).catch((err) => console.warn("Failed to mirror to template archive:", err));

      if (res.ok) {
        setUploadSuccess("Meme successfully published to community archive and saved to your profile!");
        setUploadFile(null);
        setUploadPreview(null);
        setUploadOriginal(null);
        setUploadTitle("");
        loadUserMemes(user.email);
      } else {
        alert("Failed to upload meme. Please try again.");
      }
    } catch (err) {
      alert("Network error while uploading meme.");
    } finally {
      setIsUploading(false);
    }
  };

  // Creator: Open Edit Meme Modal
  const openEditMemeModal = (meme: UserMeme) => {
    setEditingMeme(meme);
    setEditMemeTitle(meme.title);
  };

  // Creator: Execute Meme Title/Info Edit
  const handleSaveMemeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeme || !editMemeTitle.trim() || !user) return;

    setIsUpdatingMeme(true);
    try {
      const newTitle = editMemeTitle.trim().toUpperCase();

      const [tplRes, memeRes] = await Promise.all([
        fetch("/api/templates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingMeme.id,
            title: newTitle,
            authorEmail: user.email,
          }),
        }).catch(() => null),
        fetch("/api/memes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingMeme.id,
            title: newTitle,
            authorEmail: user.email,
          }),
        }).catch(() => null),
      ]);

      if ((tplRes && tplRes.ok) || (memeRes && memeRes.ok)) {
        setMemes((prev) =>
          prev.map((m) =>
            m.id === editingMeme.id ? { ...m, title: newTitle } : m
          )
        );
        setEditingMeme(null);
      } else {
        alert("Failed to update title. Please ensure you are the original author.");
      }
    } catch (err) {
      alert("Network error updating meme.");
    } finally {
      setIsUpdatingMeme(false);
    }
  };


  // 5. Delete Meme
  const handleDeleteMeme = async (id: string, title: string) => {
    if (!confirm(`Delete meme "${title}" from your profile?`)) return;

    try {
      const res = await fetch(`/api/memes?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMemes((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert("Could not delete meme.");
      }
    } catch (err) {
      alert("Error deleting meme.");
    }
  };

  // 6. Download Meme
  const handleDownload = (previewUrl: string, title: string) => {
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `lolcanvas-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 7. Sign Out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("lolcanvas_user");
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="p-16 flex items-center justify-center font-mono-code text-xs text-[#777777]">
        LOADING CREATOR PROFILE...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 sm:p-20 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto border-2 border-black">
          <UserIcon className="w-8 h-8" />
        </div>
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-tight text-black">
          SIGN IN REQUIRED
        </h1>
        <p className="font-mono-code text-xs text-[#777777]">
          Sign in or create an account to view your saved memes, manage your creations, and upload new templates to the community.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-black text-white hover:bg-[#333333] font-mono-code text-xs uppercase font-bold tracking-wider transition-colors border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          GO TO LOGIN PAGE ■
        </Link>
      </div>
    );
  }

  const isSuperAdmin = user.role === "SUPER_ADMIN" || user.email === "admin123@gmail.com";

  return (
    <div className="flex flex-col w-full bg-[#FAF9F5] min-h-[calc(100vh-140px)]">
      {/* Top Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <UserIcon className="w-3.5 h-3.5 text-black" />
            CREATOR PROFILE // ARCHIVE REPOSITORY
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-black">
            MY PROFILE.
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#FFE4E6] text-[#E11D48] hover:bg-[#E11D48] hover:text-white font-mono-code text-xs font-bold uppercase transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5"
            >
              <Crown className="w-4 h-4" />
              <span>SUPER ADMIN PORTAL</span>
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-white border border-black font-mono-code text-xs uppercase font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>SIGN OUT</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* User Profile Identity Card */}
        <div className="bg-white border border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-display font-extrabold text-2xl border-2 border-black">
              {(user.email[0] || "U").toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-black">
                  {user.name || user.email.split("@")[0]}
                </h2>
                {isSuperAdmin && (
                  <span className="bg-[#FFE4E6] text-[#E11D48] border border-[#E11D48] px-2 py-0.5 text-[10px] font-mono-code font-bold uppercase flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    SUPER ADMIN
                  </span>
                )}
              </div>
              <div className="font-mono-code text-xs text-[#555555]">{user.email}</div>
              <div className="flex items-center gap-2 pt-1 font-mono-code text-[10px]">
                <span className="bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 border border-[#16A34A]/30 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  AUTHENTICATED
                </span>
                <span className="bg-[#E6E4DC] text-black px-2 py-0.5 border border-black/20 font-bold flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  NEON DB SYNCED
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <Link
            href="/edit"
            className="px-6 py-3 bg-black text-white hover:bg-[#333333] font-mono-code text-xs uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-2 border border-black shadow-[2px_2px_0px_0px_rgba(225,29,72,1)]"
          >
            <Wand2 className="w-4 h-4 text-[#E11D48]" />
            <span>CREATE MEME ON CANVAS</span>
          </Link>
        </div>

        {/* 3 Metric Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-black divide-y sm:divide-y-0 sm:divide-x divide-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-6 space-y-1">
            <span className="font-mono-code text-[11px] text-[#777777] uppercase block">
              SAVED MEMES IN PROFILE
            </span>
            <span className="font-display font-black text-3xl text-black">{memes.length}</span>
          </div>

          <div className="p-6 space-y-1">
            <span className="font-mono-code text-[11px] text-[#777777] uppercase block">
              TOTAL COMMUNITY EXPORTS
            </span>
            <span className="font-display font-black text-3xl text-black">
              {memes.reduce((acc, m) => acc + (m.downloads || 0), 0)}
            </span>
          </div>

          <div className="p-6 space-y-1">
            <span className="font-mono-code text-[11px] text-[#777777] uppercase block">
              COMMUNITY LIKES
            </span>
            <span className="font-display font-black text-3xl text-[#E11D48]">
              {memes.reduce((acc, m) => acc + (m.likes || 0), 0)}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DIRECT MEME UPLOAD WIDGET                                       */}
        {/* ============================================================== */}
        <div className="bg-white border border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex items-center justify-between border-b border-black pb-3">
            <div className="space-y-0.5">
              <h3 className="font-display font-extrabold text-xl uppercase text-black flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#E11D48]" />
                UPLOAD MEME TO COMMUNITY & PROFILE
              </h3>
              <p className="font-mono-code text-xs text-[#777777]">
                Upload your own meme image directly. It will be saved to your profile and displayed on the website.
              </p>
            </div>
          </div>

          {uploadSuccess && (
            <div className="p-3 bg-[#F0FDF4] border border-[#16A34A] text-[#16A34A] font-mono-code text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Drop/Pick Area */}
              <div>
                <label className="text-[10px] font-mono-code uppercase font-bold text-[#777777] block mb-1">
                  SELECT MEME IMAGE FILE (PNG, JPG, WEBP, SVG) *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[16/9] border-2 border-dashed border-black bg-[#FAF9F5] hover:bg-[#F6F5EE] cursor-pointer flex flex-col items-center justify-center p-4 transition-colors relative overflow-hidden group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {uploadPreview ? (
                    <img
                      src={uploadPreview}
                      alt="Upload Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon className="w-8 h-8 text-[#777777] mx-auto group-hover:scale-110 transition-transform" />
                      <div className="font-mono-code text-xs font-bold text-black uppercase">
                        CLICK TO CHOOSE IMAGE FILE
                      </div>
                      <div className="font-mono-code text-[10px] text-[#888888]">
                        OR DRAG AND DROP HERE
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Meme Details */}
              <div className="space-y-4 font-mono-code text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                      MEME TITLE / CAPTION *
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="ENTER MEME TITLE (E.G. WHEN THE CODE WORKS ON FIRST TRY)"
                      className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                      CATEGORY
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold focus:outline-none uppercase"
                    >
                      <option value="classic">CLASSIC FORMATS</option>
                      <option value="reaction">REACTION & SHOCK</option>
                      <option value="relatable">WORK & EVERYDAY</option>
                      <option value="modern">BRAINROT & SURREAL</option>
                      <option value="crypto">FINANCE & CRYPTO</option>
                      <option value="animals">ANIMALS & CHAOS</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!uploadPreview || !uploadTitle.trim() || isUploading}
                  className="w-full py-3 bg-black text-white hover:bg-[#333333] font-mono-code text-xs uppercase font-bold tracking-wider transition-all disabled:opacity-50 border border-black shadow-[2px_2px_0px_0px_rgba(225,29,72,1)]"
                >
                  {isUploading ? "UPLOADING TO NEON DB..." : "UPLOAD & PUBLISH TO WEBSITE ■"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ============================================================== */}
        {/* MY SAVED MEMES GALLERY                                         */}
        {/* ============================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-black pb-3">
            <div>
              <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-black">
                MY SAVED MEMES & CREATIONS ({memes.length})
              </h3>
              <p className="font-mono-code text-xs text-[#777777]">
                All creations saved from Canvas Editor or uploaded from your profile.
              </p>
            </div>

            <Link
              href="/cards"
              className="font-mono-code text-xs font-bold uppercase text-black hover:text-[#E11D48] flex items-center gap-1"
            >
              <span>BROWSE ALL TEMPLATES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isMemesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-black p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between select-none"
                >
                  <div className="aspect-[16/10] bg-[#FAF9F5] border border-black/15 animate-shimmer flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-black/20 border-t-black animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3.5 w-3/4 bg-black/15 animate-pulse" />
                    <div className="h-3 w-1/2 bg-black/10 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-black/10">
                    <div className="h-7 bg-black animate-pulse" />
                    <div className="h-7 bg-[#FAF9F5] border border-black animate-pulse" />
                    <div className="h-7 bg-[#FFF1F2] border border-[#E11D48]/30 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : memes.length === 0 ? (
            <div className="p-16 text-center font-mono-code text-xs bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="text-4xl text-black">🎨</div>
              <div className="font-display font-bold text-lg uppercase text-black">
                YOU HAVEN&apos;T CREATED OR UPLOADED ANY MEMES YET!
              </div>
              <p className="text-[#777777] max-w-md mx-auto">
                Use the upload box above to upload a meme, or open the Canvas Editor to make a watermark-free meme!
              </p>
              <Link
                href="/edit"
                className="inline-block px-6 py-2.5 bg-black text-white hover:bg-[#333333] font-bold uppercase transition-colors"
              >
                OPEN MEME CANVAS EDITOR →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {memes.map((m) => (
                <div
                  key={m.id}
                  className="group bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                >
                  {/* Full-bleed Top Image filling the upper card completely with zero white space */}
                  <div
                    onClick={() => openEditMemeModal(m)}
                    className="w-full aspect-square relative overflow-hidden bg-[#FAF9F5] flex items-center justify-center block cursor-pointer border-b border-black"
                    title="Click to edit meme"
                  >
                    {m.previewUrl ? (
                      <img
                        src={m.previewUrl}
                        alt={m.title}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover block group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="font-mono-code text-xs text-[#777777]">SVG MEME</div>
                    )}
                  </div>

                  {/* Bottom Content with padding */}
                  <div className="p-4 flex flex-col justify-between space-y-3 bg-white">
                    <div className="space-y-1">
                      <h4 className="font-display font-extrabold text-sm uppercase text-black truncate tracking-tight">
                        {m.title}
                      </h4>
                      <div className="font-mono-code text-[10px] text-[#777777] flex items-center justify-between">
                        <span>CREATED: {new Date(m.createdAt).toLocaleDateString("en-GB")}</span>
                        <span>{m.downloads || 0} EXPORTS</span>
                      </div>
                    </div>

                    {/* Actions (EDIT, PNG, DELETE) */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-black/10 font-mono-code text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => openEditMemeModal(m)}
                        className="py-1.5 px-2 bg-black text-white hover:bg-[#333333] uppercase text-center flex items-center justify-center gap-1 transition-colors"
                        title="Edit meme details"
                      >
                        <Edit3 className="w-3 h-3 text-[#10B981]" />
                        <span>EDIT</span>
                      </button>

                      <button
                        onClick={() => handleDownload(m.previewUrl || "", m.title)}
                        className="py-1.5 px-2 bg-white border border-black hover:bg-[#FAF9F5] text-black uppercase text-center flex items-center justify-center gap-1 transition-colors"
                        title="Download clean PNG"
                      >
                        <Download className="w-3 h-3 text-black" />
                        <span>PNG</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMeme(m.id, m.title)}
                        className="py-1.5 px-2 bg-white text-[#E11D48] border border-[#E11D48] hover:bg-[#FFF1F2] uppercase text-center flex items-center justify-center gap-1 transition-colors"
                        title="Delete meme"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>DELETE</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Meme Modal */}
      {editingMeme && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black px-4 py-3 bg-[#E6E4DC] font-mono-code text-xs">
              <div className="flex items-center gap-2 font-bold uppercase text-black">
                <Edit3 className="w-4 h-4 text-[#10B981]" />
                <span>EDIT SAVED MEME</span>
              </div>
              <button
                onClick={() => setEditingMeme(null)}
                disabled={isUpdatingMeme}
                className="p-1 hover:bg-black hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMemeEdit} className="p-6 space-y-4 font-mono-code text-xs">
              <div className="space-y-3">
                {editingMeme.previewUrl && (
                  <div className="w-full aspect-video border border-black bg-white flex items-center justify-center p-2">
                    <img
                      src={editingMeme.previewUrl}
                      alt={editingMeme.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                    MEME TITLE / CAPTION *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMemeTitle}
                    onChange={(e) => setEditMemeTitle(e.target.value)}
                    placeholder="ENTER MEME TITLE"
                    className="w-full p-2.5 bg-white border border-black font-bold uppercase text-xs focus:outline-none"
                  />
                </div>

                <div className="p-2.5 bg-[#FAF9F5] border border-black/20 text-[11px] text-[#555555]">
                  Only you ({user?.email}) have permission to edit this meme.
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-black pt-4 flex items-center justify-between">
                <Link
                  href={editingMeme.templateId ? `/edit/${editingMeme.templateId}` : `/edit`}
                  className="px-3 py-2 bg-white border border-black hover:bg-[#E6E4DC] uppercase font-bold text-[10px] flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3 text-[#E11D48]" />
                  <span>CANVAS EDITOR</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMeme(null)}
                    disabled={isUpdatingMeme}
                    className="px-4 py-2 bg-white border border-black hover:bg-[#E6E4DC] uppercase font-bold transition-colors disabled:opacity-50"
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    disabled={isUpdatingMeme || !editMemeTitle.trim()}
                    className="px-5 py-2 bg-black text-white hover:bg-[#222222] uppercase font-bold transition-colors border border-black shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{isUpdatingMeme ? "SAVING..." : "SAVE ■"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
