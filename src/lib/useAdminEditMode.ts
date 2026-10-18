"use client";

import { useState, useEffect, useCallback } from "react";

export function useAdminEditMode() {
  const [isEditMode, setIsEditModeState] = useState<boolean>(false);
  const [themeAccent, setThemeAccentState] = useState<string>("#E11D48");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("lolcanvas_admin_edit_mode");
      if (stored === "true") {
        setIsEditModeState(true);
      }
      const storedAccent = localStorage.getItem("lolcanvas_theme_accent");
      if (storedAccent) {
        setThemeAccentState(storedAccent);
      }
    } catch (e) {}

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isEditMode: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isEditMode === "boolean") {
        setIsEditModeState(customEvent.detail.isEditMode);
      }
    };

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ accent: string }>;
      if (customEvent.detail?.accent) {
        setThemeAccentState(customEvent.detail.accent);
      }
    };

    window.addEventListener("lolcanvas_admin_edit_mode_changed", handleModeChange);
    window.addEventListener("lolcanvas_theme_changed", handleThemeChange);

    return () => {
      window.removeEventListener("lolcanvas_admin_edit_mode_changed", handleModeChange);
      window.removeEventListener("lolcanvas_theme_changed", handleThemeChange);
    };
  }, []);

  const setEditMode = useCallback((active: boolean) => {
    setIsEditModeState(active);
    try {
      localStorage.setItem("lolcanvas_admin_edit_mode", active ? "true" : "false");
    } catch (e) {}
    window.dispatchEvent(
      new CustomEvent("lolcanvas_admin_edit_mode_changed", {
        detail: { isEditMode: active },
      })
    );
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditModeState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("lolcanvas_admin_edit_mode", next ? "true" : "false");
      } catch (e) {}
      window.dispatchEvent(
        new CustomEvent("lolcanvas_admin_edit_mode_changed", {
          detail: { isEditMode: next },
        })
      );
      return next;
    });
  }, []);

  const setThemeAccent = useCallback((color: string) => {
    setThemeAccentState(color);
    try {
      localStorage.setItem("lolcanvas_theme_accent", color);
    } catch (e) {}
    window.dispatchEvent(
      new CustomEvent("lolcanvas_theme_changed", {
        detail: { accent: color },
      })
    );
  }, []);

  return {
    isEditMode: mounted ? isEditMode : false,
    themeAccent,
    setEditMode,
    toggleEditMode,
    setThemeAccent,
  };
}
