"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, LogOut, Heart, Wand2 } from "lucide-react";
import { TEMPLATES } from "@/lib/data";

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setIsLoggedIn(true);
  };

  const demoFavorites = TEMPLATES.slice(0, 3);

  return (
    <div className="flex flex-col w-full bg-[#FAF9F5]">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <User className="w-3 h-3 text-black" />
            CREATOR PORTAL
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black">
            CREATOR ACCOUNT.
          </h1>
        </div>

        <span className="font-mono-code text-xs text-[#555555] hidden sm:inline">
          ZERO PAYWALLS
        </span>
      </div>

      {isLoggedIn ? (
        <div className="p-6 sm:p-10 space-y-8 max-w-4xl mx-auto w-full">
          <div className="p-5 bg-white border border-black flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-display font-bold">
                LC
              </div>
              <div>
                <h2 className="font-display font-bold text-base uppercase text-black">
                  {email || "DEMO CREATOR"}
                </h2>
                <span className="font-mono-code text-[11px] text-[#10B981] font-bold">
                  SESSION ACTIVE
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsLoggedIn(false)}
              className="px-3 py-1.5 bg-[#E6E4DC] border border-black font-mono-code text-xs uppercase font-bold hover:bg-black hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              DISCONNECT
            </button>
          </div>

          {/* Bookmarked Favorites */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-black pb-2 font-mono-code text-xs font-bold uppercase text-black">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#E11D48]" />
                SAVED FAVORITES ({demoFavorites.length})
              </span>
              <Link href="/cards" className="hover:underline">
                MORE →
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
                    className="w-full py-1.5 bg-black text-white hover:bg-[#333333] font-mono-code text-[11px] font-bold uppercase text-center flex items-center justify-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    REMIX
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-12 flex justify-center">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md bg-white border border-black p-6 sm:p-8 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="font-display font-extrabold text-xl uppercase tracking-tight text-black">
              SIGN IN
            </h2>

            <div className="space-y-1 font-mono-code text-xs">
              <label className="text-[10px] text-[#777777] uppercase font-bold">
                EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="CREATOR@LOLCANVAS.STUDIO"
                className="w-full p-2.5 bg-[#FAF9F5] border border-black text-xs font-bold uppercase focus:outline-none"
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
              className="w-full py-3 bg-black text-white hover:bg-[#333333] font-mono-code text-xs uppercase font-bold tracking-wider transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              SIGN IN ■
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail("CREATOR.DEMO");
                setIsLoggedIn(true);
              }}
              className="w-full py-2 bg-[#FAF9F5] border border-black hover:bg-[#E6E4DC] font-mono-code text-xs uppercase font-bold text-black"
            >
              ⚡ QUICK GUEST SIGN-IN
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
