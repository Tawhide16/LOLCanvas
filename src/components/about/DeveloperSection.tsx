"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Globe,
  Crown,
  ExternalLink,
  Code2,
  Terminal,
  Sparkles,
  UploadCloud,
  Check,
  X,
  RotateCcw,
  Loader2,
  Briefcase,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { processImageForWeb } from "@/lib/imageOptimizer";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface DeveloperProfile {
  name: string;
  role: string;
  avatarUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  bio: string;
  skills: string[];
}

const DEFAULT_PROFILE: DeveloperProfile = {
  name: "Tawhid",
  role: "Lead Full-Stack Software Engineer & Creator",
  avatarUrl: "/developer.jpg",
  githubUrl: "https://github.com/Tawhide16",
  portfolioUrl: "https://my-protfulio-eight.vercel.app/",
  bio: "Passionate full-stack software engineer building fast, responsive, and scalable web applications. Creator and architect of LOLCanvas — engineered from scratch with Next.js 16, React 19, TypeScript, and HTML5 Canvas to give creators an editorial, zero-watermark meme publishing engine.",
  skills: [
    "Next.js 16 / React 19",
    "TypeScript",
    "PostgreSQL & Prisma",
    "HTML5 Canvas 2D Engine",
    "Full-Stack Web Architecture",
    "Tailwind & Modern CSS",
  ],
};

export default function DeveloperSection() {
  const [profile, setProfile] = useState<DeveloperProfile>(DEFAULT_PROFILE);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Modal edit states
  const [editAvatarUrl, setEditAvatarUrl] = useState(DEFAULT_PROFILE.avatarUrl);
  const [editName, setEditName] = useState(DEFAULT_PROFILE.name);
  const [editBio, setEditBio] = useState(DEFAULT_PROFILE.bio);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Read persistent developer profile if custom image was uploaded
    try {
      const stored = localStorage.getItem("lolcanvas_developer_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile((prev) => ({ ...prev, ...parsed }));
        setEditAvatarUrl(parsed.avatarUrl || DEFAULT_PROFILE.avatarUrl);
        setEditName(parsed.name || DEFAULT_PROFILE.name);
        setEditBio(parsed.bio || DEFAULT_PROFILE.bio);
      }
    } catch (e) {}

    // 2. Evaluate Super Admin status
    const evaluateAdmin = (email: string | null, role?: string | null) => {
      if (!email) return false;
      if (email.toLowerCase() === "admin123@gmail.com") return true;
      if (role === "SUPER_ADMIN" || role === "ADMIN") return true;
      return false;
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        const role = (session.user.app_metadata?.role || session.user.user_metadata?.role) as string;
        setIsAdmin(evaluateAdmin(session.user.email, role));
      } else if (typeof window !== "undefined") {
        try {
          const local = localStorage.getItem("lolcanvas_user");
          if (local) {
            const parsed = JSON.parse(local);
            setIsAdmin(evaluateAdmin(parsed.email, parsed.role));
          }
        } catch (e) {}
      }
    });
  }, []);

  const handleImageFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, SVG, WebP)");
      return;
    }
    setIsProcessingImage(true);
    try {
      const optimized = await processImageForWeb(file, 800, 0.9);
      setEditAvatarUrl(optimized.previewDataUri);
    } catch (e) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") setEditAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedProfile: DeveloperProfile = {
      ...profile,
      name: editName.trim() || DEFAULT_PROFILE.name,
      avatarUrl: editAvatarUrl || DEFAULT_PROFILE.avatarUrl,
      bio: editBio.trim() || DEFAULT_PROFILE.bio,
    };

    try {
      localStorage.setItem("lolcanvas_developer_profile", JSON.stringify(updatedProfile));
    } catch (e) {}

    setProfile(updatedProfile);
    setIsSaving(false);
    setShowEditModal(false);
  };

  const handleResetToDefault = () => {
    setEditAvatarUrl(DEFAULT_PROFILE.avatarUrl);
    setEditName(DEFAULT_PROFILE.name);
    setEditBio(DEFAULT_PROFILE.bio);
  };

  return (
    <section className="w-full border-b border-black bg-white select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-black px-6 sm:px-8 py-3 bg-[#E6E4DC] font-mono-code text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#E11D48]" />
          <span className="font-bold uppercase tracking-wider text-black">
            ARCHITECT & LEAD ENGINEER SPOTLIGHT
          </span>
        </div>
        <span className="text-[11px] text-[#555555] uppercase hidden sm:inline">
          PORTFOLIO & GITHUB VERIFIED
        </span>
      </div>

      <div className="p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Developer Photo Box (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start">
            <div className="relative group w-full max-w-[340px] aspect-square bg-[#FAF9F5] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />

              {/* Status Ribbon */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-black px-2.5 py-1 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-mono-code text-[10px] font-bold uppercase text-black tracking-wider">
                  OPEN TO OPPORTUNITIES
                </span>
              </div>

              {/* Super Admin Quick Edit Button Overlay */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="absolute bottom-3 right-3 bg-[#FFE4E6] border border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48] hover:text-white px-2.5 py-1 text-[10px] font-mono-code font-bold uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] transition-colors"
                >
                  <Crown className="w-3 h-3" />
                  <span>EDIT PHOTO</span>
                </button>
              )}
            </div>

            {/* Sub-label */}
            <div className="mt-3 font-mono-code text-[11px] text-[#777777] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black" />
              <span>GITHUB: @Tawhide16 // CREATOR</span>
            </div>
          </div>

          {/* Details & Biography (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FAF9F5] border border-black text-[11px] font-mono-code uppercase font-bold text-[#E11D48]">
                <Sparkles className="w-3 h-3 text-[#E11D48]" />
                CREATOR OF LOLCANVAS
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-black">
                {profile.name}
              </h2>

              <p className="font-mono-code text-sm font-semibold text-[#555555] uppercase tracking-wide">
                {profile.role}
              </p>
            </div>

            {/* Short Bio */}
            <p className="font-body text-sm sm:text-base text-[#333333] leading-relaxed max-w-2xl">
              {profile.bio}
            </p>

            {/* Key Stack Badges */}
            <div className="space-y-2">
              <span className="font-mono-code text-[10px] uppercase font-bold text-[#777777] block tracking-wider">
                ENGINEERING EXPERTISE & STACK
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono-code text-[11px]">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-[#FAF9F5] border border-black text-black font-medium hover:bg-black hover:text-white transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Links & CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 font-mono-code text-xs">
              {/* GitHub Link */}
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-black text-white hover:bg-[#222222] font-bold uppercase tracking-wider flex items-center gap-2 border border-black shadow-[3px_3px_0px_0px_rgba(225,29,72,1)] transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                <GithubIcon className="w-4 h-4 text-white" />
                <span>GITHUB PROFILE</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#E11D48]" />
              </a>

              {/* Portfolio Link */}
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#FAF9F5] text-black hover:bg-[#E6E4DC] font-bold uppercase tracking-wider flex items-center gap-2 border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                <Globe className="w-4 h-4 text-[#E11D48]" />
                <span>LIVE PORTFOLIO</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>

              {/* Super Admin Trigger (Desktop) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="px-3 py-3 bg-[#FFE4E6] text-[#E11D48] hover:bg-[#E11D48] hover:text-white border border-[#E11D48] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>ADMIN: EDIT PROFILE</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Super Admin Developer Profile & Photo Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black px-5 py-3 bg-[#E6E4DC] font-mono-code text-xs">
              <div className="flex items-center gap-2 font-bold uppercase text-black">
                <Crown className="w-4 h-4 text-[#E11D48]" />
                <span>SUPER ADMIN // UPDATE DEVELOPER PHOTO & PROFILE</span>
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

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 font-mono-code text-xs">
              {/* Image Preview & Upload */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#777777] uppercase font-bold block">
                  DEVELOPER PHOTO (PNG, JPG, WEBP)
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0 overflow-hidden">
                    <img
                      src={editAvatarUrl}
                      alt="Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-black/40 hover:border-black p-3 text-center bg-white hover:bg-[#F6F5EE] transition-colors cursor-pointer flex flex-col items-center justify-center"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] && handleImageFileChange(e.target.files[0])
                      }
                      className="hidden"
                    />
                    {isProcessingImage ? (
                      <div className="flex items-center gap-2 text-black">
                        <Loader2 className="w-4 h-4 animate-spin text-[#E11D48]" />
                        <span>PROCESSING PHOTO...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-[#E11D48] mb-1" />
                        <span className="font-bold uppercase text-[10px] text-black">
                          CLICK TO REPLACE DEVELOPER PHOTO
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Developer Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold block">
                  DEVELOPER NAME
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 bg-white border border-black font-bold uppercase text-xs focus:outline-none"
                />
              </div>

              {/* Short Bio */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#777777] uppercase font-bold block">
                  SHORT BIO & DETAILS
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-2 bg-white border border-black text-xs focus:outline-none font-body"
                />
              </div>

              {/* Actions */}
              <div className="border-t border-black pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetToDefault}
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
                    <Check className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span>SAVE PROFILE ■</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
