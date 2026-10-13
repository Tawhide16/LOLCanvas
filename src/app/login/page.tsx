"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, LogOut, Heart, Wand2, ShieldCheck, Database, AlertCircle, CheckCircle2, ArrowRight, Crown } from "lucide-react";
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

  // 1. Listen for Supabase Auth state changes & local storage user
  useEffect(() => {
    async function getSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
        } else {
          // Check local DB user session
          const local = localStorage.getItem("lolcanvas_user");
          if (local) {
            const userObj = JSON.parse(local);
            setCurrentUser({
              id: userObj.id,
              email: userObj.email,
              app_metadata: { provider: "DATABASE", role: userObj.role },
              user_metadata: { name: userObj.name, role: userObj.role },
              created_at: userObj.createdAt || new Date().toISOString(),
            } as any);
          }
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
      } finally {
        setIsLoadingSession(false);
      }
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setCurrentUser(session.user);
        }
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
        // Mode: LOGIN
        // 1. Check Neon DB credentials via /api/auth/login first
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (res.ok) {
            const resData = await res.json();
            const userObj = resData.data.user;
            localStorage.setItem("lolcanvas_user", JSON.stringify(userObj));
            setCurrentUser({
              id: userObj.id,
              email: userObj.email,
              app_metadata: { provider: "DATABASE", role: userObj.role },
              user_metadata: { name: userObj.name, role: userObj.role },
              created_at: userObj.createdAt || new Date().toISOString(),
            } as any);

            if (userObj.role === "SUPER_ADMIN" || userObj.email === "admin123@gmail.com") {
              setAuthSuccess("👑 SUPER ADMIN VERIFIED! REDIRECTING TO COMMAND CENTER...");
              setTimeout(() => {
                window.location.href = "/admin";
              }, 700);
              return;
            }

            setAuthSuccess("Signed in successfully!");
            setTimeout(() => {
              window.location.reload();
            }, 600);
            return;
          }
        } catch (apiErr) {
          console.warn("Direct DB auth failed, attempting Supabase fallback...", apiErr);
        }

        // 2. Fallback to Supabase login
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

  // 3. Handle Social OAuth Login (Google & GitHub)
  const [isOAuthLoading, setIsOAuthLoading] = useState<"google" | "github" | null>(null);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsOAuthLoading(provider);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Failed to authenticate with ${provider}`;
      setAuthError(message);
      setIsOAuthLoading(null);
    }
  };

  // 4. Handle Logout
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("lolcanvas_user");
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setCurrentUser(null);
    setAuthSuccess(null);
    setAuthError(null);
    window.location.reload();
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

          {/* Super Admin Privileges Banner */}
          {(currentUser.email === "admin123@gmail.com" || (currentUser as any).app_metadata?.role === "SUPER_ADMIN") && (
            <div className="p-4 bg-[#FFE4E6] border border-[#E11D48] shadow-[4px_4px_0px_0px_rgba(225,29,72,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono-code text-xs">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-[#E11D48] shrink-0" />
                <div>
                  <div className="font-display font-black text-sm uppercase text-black">
                    SUPER ADMIN ACCESS ACTIVE
                  </div>
                  <div className="text-[10px] text-[#555555]">
                    Full platform monitoring, user management, meme moderation, and audit logs.
                  </div>
                </div>
              </div>

              <Link
                href="/admin"
                className="px-4 py-2 bg-[#E11D48] text-white hover:bg-black font-bold uppercase transition-colors shrink-0 text-center flex items-center justify-center gap-1.5 border border-black"
              >
                <span>OPEN COMMAND CENTER</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

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

            {/* Social OAuth Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/20"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono-code">
                <span className="bg-white px-3 text-[#777777] font-bold">OR CONTINUE WITH</span>
              </div>
            </div>

            {/* Social OAuth Buttons */}
            <div className="grid grid-cols-2 gap-2.5 font-mono-code text-xs">
              {/* Google Login */}
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                disabled={isOAuthLoading !== null}
                className="p-2.5 bg-white border border-black hover:bg-[#FAF9F5] transition-all flex items-center justify-center gap-2 font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isOAuthLoading === "google" ? "WAIT..." : "GOOGLE"}</span>
              </button>

              {/* GitHub Login */}
              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                disabled={isOAuthLoading !== null}
                className="p-2.5 bg-black text-white border border-black hover:bg-[#222222] transition-all flex items-center justify-center gap-2 font-bold uppercase shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] active:translate-y-[1px] disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>{isOAuthLoading === "github" ? "WAIT..." : "GITHUB"}</span>
              </button>
            </div>

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
