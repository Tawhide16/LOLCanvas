"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, LogOut, Heart, Wand2, ShieldCheck, Database, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { TEMPLATES } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function LoginPage() {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // 1. Listen for Supabase Auth state changes
  useEffect(() => {
    async function getSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user ?? null);
      } catch (err) {
        console.error("Failed to fetch session:", err);
      } finally {
        setIsLoadingSession(false);
      }
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Handle Login & Signup
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user && data.session) {
          setCurrentUser(data.user);
          setAuthSuccess("Account created and signed in successfully!");
        } else {
          setAuthSuccess(
            "Account registered! If confirmation is required, please check your email inbox to verify."
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setCurrentUser(data.user);
        setAuthSuccess("Signed in successfully!");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Logout
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setAuthSuccess(null);
    setAuthError(null);
  };

  const demoFavorites = TEMPLATES.slice(0, 3);

  return (
    <div className="flex flex-col w-full bg-[#FAF9F5] min-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <UserIcon className="w-3 h-3 text-black" />
            CREATOR PORTAL // SUPABASE AUTH
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black">
            CREATOR ACCOUNT.
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono-code text-xs">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          <span className="text-black font-bold uppercase">AUTH SERVICE READY</span>
        </div>
      </div>

      {isLoadingSession ? (
        <div className="p-16 flex items-center justify-center font-mono-code text-xs text-[#777777]">
          VERIFYING SUPABASE SESSION...
        </div>
      ) : currentUser ? (
        /* LOGGED-IN CREATOR DASHBOARD */
        <div className="p-6 sm:p-10 space-y-8 max-w-4xl mx-auto w-full">
          {/* User Profile Card */}
          <div className="p-6 bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-display font-extrabold text-lg">
                {(currentUser.email?.[0] || "U").toUpperCase()}
              </div>
              <div>
                <h2 className="font-display font-bold text-lg uppercase text-black">
                  {currentUser.email}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 font-mono-code text-[10px]">
                  <span className="bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 border border-[#16A34A]/30 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    SUPABASE AUTH ACTIVE
                  </span>
                  <span className="bg-[#E6E4DC] text-black px-2 py-0.5 border border-black/20 font-bold flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    NEON DB SYNCED
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-[#FAF9F5] border border-black font-mono-code text-xs uppercase font-bold hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              SIGN OUT
            </button>
          </div>

          {/* User Meta Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-code text-xs">
            <div className="p-4 bg-white border border-black space-y-1">
              <span className="text-[10px] text-[#777777] uppercase block">USER ID</span>
              <span className="font-bold text-black text-[11px] truncate block" title={currentUser.id}>
                {currentUser.id}
              </span>
            </div>
            <div className="p-4 bg-white border border-black space-y-1">
              <span className="text-[10px] text-[#777777] uppercase block">PROVIDER</span>
              <span className="font-bold text-black uppercase">
                {currentUser.app_metadata.provider || "EMAIL"}
              </span>
            </div>
            <div className="p-4 bg-white border border-black space-y-1">
              <span className="text-[10px] text-[#777777] uppercase block">CREATED DATE</span>
              <span className="font-bold text-black">
                {new Date(currentUser.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Bookmarked / Saved Creations */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between border-b border-black pb-2 font-mono-code text-xs font-bold uppercase text-black">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#E11D48]" />
                FAVORITE TEMPLATES ({demoFavorites.length})
              </span>
              <Link href="/cards" className="hover:underline flex items-center gap-1">
                VIEW ARCHIVE <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {demoFavorites.map((t) => (
                <div key={t.id} className="bg-white border border-black p-3 space-y-2">
                  <div className="aspect-[4/3] bg-[#FAF9F5] border border-black/15 p-2 flex items-center justify-center">
                    <img src={t.svgDataUri} alt={t.title} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="font-display font-bold text-xs uppercase text-black truncate">
                    {t.title}
                  </div>
                  <Link
                    href={`/edit/${t.slug}`}
                    className="w-full py-1.5 bg-black text-white hover:bg-[#333333] font-mono-code text-[11px] font-bold uppercase text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <Wand2 className="w-3 h-3" />
                    OPEN IN CANVAS
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* LOGIN / SIGNUP FORM */
        <div className="p-6 sm:p-12 flex justify-center">
          <div className="w-full max-w-md bg-white border border-black p-6 sm:p-8 space-y-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 border border-black divide-x divide-black font-mono-code text-xs font-bold bg-[#FAF9F5]">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`py-2.5 px-3 uppercase text-center transition-colors ${
                  mode === "login" ? "bg-black text-white" : "text-[#777777] hover:text-black"
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className={`py-2.5 px-3 uppercase text-center transition-colors ${
                  mode === "signup" ? "bg-black text-white" : "text-[#777777] hover:text-black"
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-extrabold text-xl uppercase tracking-tight text-black">
                {mode === "login" ? "SIGN IN TO LOLCANVAS" : "JOIN CREATOR COMMONS"}
              </h2>
              <p className="font-body text-xs text-[#777777]">
                {mode === "login"
                  ? "Access your watermark-free meme designs and saved templates."
                  : "Create your free creator profile powered by Supabase Authentication."}
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 bg-[#FFF1F2] border border-[#E11D48] text-[#E11D48] font-mono-code text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success Message */}
            {authSuccess && (
              <div className="p-3 bg-[#F0FDF4] border border-[#16A34A] text-[#16A34A] font-mono-code text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1 font-mono-code text-xs">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="CREATOR@LOLCANVAS.STUDIO"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1 font-mono-code text-xs">
                <label className="text-[10px] text-[#777777] uppercase font-bold">
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-black text-white hover:bg-[#333333] font-mono-code text-xs uppercase font-bold tracking-wider transition-all hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50"
              >
                {isSubmitting
                  ? "AUTHENTICATING..."
                  : mode === "login"
                  ? "SIGN IN ■"
                  : "REGISTER CREATOR ACCOUNT ■"}
              </button>
            </form>

            <div className="pt-2 text-center font-mono-code text-[11px] text-[#777777]">
              <span>POWERED BY </span>
              <span className="font-bold text-black">SUPABASE AUTH</span>
              <span> & </span>
              <span className="font-bold text-black">NEON DB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
