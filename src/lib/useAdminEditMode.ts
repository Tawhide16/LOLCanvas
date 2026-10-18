"use client";

import { useSyncExternalStore, useCallback } from "react";

// In-memory singleton state
let currentEditMode = false;
let currentThemeAccent = "#E11D48";
let initialized = false;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {}
  });
}

function initFromStorage() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const storedMode = localStorage.getItem("lolcanvas_admin_edit_mode");
    if (storedMode === "true") currentEditMode = true;
    const storedAccent = localStorage.getItem("lolcanvas_theme_accent");
    if (storedAccent) currentThemeAccent = storedAccent;
  } catch (e) {}
}

const editModeStore = {
  subscribe(listener: () => void) {
    initFromStorage();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot() {
    initFromStorage();
    return currentEditMode;
  },
  getServerSnapshot() {
    return false;
  },
};

const themeAccentStore = {
  subscribe(listener: () => void) {
    initFromStorage();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot() {
    initFromStorage();
    return currentThemeAccent;
  },
  getServerSnapshot() {
    return "#E11D48";
  },
};

export function useAdminEditMode() {
  const isEditMode = useSyncExternalStore(
    editModeStore.subscribe,
    editModeStore.getSnapshot,
    editModeStore.getServerSnapshot
  );

  const themeAccent = useSyncExternalStore(
    themeAccentStore.subscribe,
    themeAccentStore.getSnapshot,
    themeAccentStore.getServerSnapshot
  );

  const setEditMode = useCallback((active: boolean) => {
    currentEditMode = active;
    try {
      localStorage.setItem("lolcanvas_admin_edit_mode", active ? "true" : "false");
    } catch (e) {}
    notify();
  }, []);

  const toggleEditMode = useCallback(() => {
    const next = !currentEditMode;
    currentEditMode = next;
    try {
      localStorage.setItem("lolcanvas_admin_edit_mode", next ? "true" : "false");
    } catch (e) {}
    notify();
  }, []);

  const setThemeAccent = useCallback((color: string) => {
    currentThemeAccent = color;
    try {
      localStorage.setItem("lolcanvas_theme_accent", color);
    } catch (e) {}
    notify();
  }, []);

  return {
    isEditMode,
    themeAccent,
    setEditMode,
    toggleEditMode,
    setThemeAccent,
  };
}
