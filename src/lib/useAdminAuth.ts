"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export function evaluateAdmin(email: string | null | undefined, role?: string | null | undefined): boolean {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail === "admin123@gmail.com") return true;
  if (role === "SUPER_ADMIN" || role === "ADMIN") return true;
  return false;
}

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local storage cache
    try {
      const local = localStorage.getItem("lolcanvas_user");
      if (local) {
        const parsed = JSON.parse(local);
        setUserEmail(parsed.email || null);
        setIsAdmin(evaluateAdmin(parsed.email, parsed.role));
      }
    } catch (e) {}

    // 2. Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const role = (session.user.app_metadata?.role || session.user.user_metadata?.role) as string;
        setIsAdmin(evaluateAdmin(session.user.email, role));
      }
    });

    // 3. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        const role = (session.user.app_metadata?.role || session.user.user_metadata?.role) as string;
        setIsAdmin(evaluateAdmin(session.user.email, role));
      } else {
        try {
          const local = localStorage.getItem("lolcanvas_user");
          if (!local) {
            setUserEmail(null);
            setIsAdmin(false);
          }
        } catch (e) {}
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, userEmail };
}
