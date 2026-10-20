import { create } from "zustand";
import type { CanvasLayer } from "@/types";

export interface EditorHistoryStep {
  canvasJson: string;
  width: number;
  height: number;
  backgroundColor: string;
  layersMeta: Array<{
    id: string;
    name: string;
    type: string;
    locked: boolean;
    visible: boolean;
    zIndex: number;
  }>;
}

export interface EditorState {
  // Canvas geometry & view
  width: number;
  height: number;
  zoom: number;
  backgroundColor: string;
  activePresetName: string;
  isGridVisible: boolean;
  isSnappingEnabled: boolean;

  // Selection
  selectedLayerIds: string[];
  activeObjectProps: {
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    textAlign?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    isUppercase?: boolean;
    lineHeight?: number;
    charSpacing?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    opacity?: number;
    angle?: number;
    scaleX?: number;
    scaleY?: number;
  } | null;

  // Layers list metadata
  layers: Array<{
    id: string;
    name: string;
    type: "text" | "image" | "sticker" | "group";
    locked: boolean;
    visible: boolean;
    zIndex: number;
    previewUrl?: string;
  }>;

  // 50-step History Stack
  history: EditorHistoryStep[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Modals & UI
  showShortcutsModal: boolean;
  showExportModal: boolean;

  // Actions
  setCanvasSize: (width: number, height: number, presetName?: string) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setBackgroundColor: (color: string) => void;
  setGridVisible: (visible: boolean) => void;
  setSnappingEnabled: (enabled: boolean) => void;
  setSelectedLayerIds: (ids: string[]) => void;
  setActiveObjectProps: (props: EditorState["activeObjectProps"]) => void;
  setLayers: (layers: EditorState["layers"]) => void;
  updateLayerMeta: (id: string, updates: Partial<EditorState["layers"][0]>) => void;

  // History Actions
  pushHistory: (step: EditorHistoryStep) => void;
  undo: () => EditorHistoryStep | null;
  redo: () => EditorHistoryStep | null;
  resetHistory: (initialStep: EditorHistoryStep) => void;

  // UI modal toggles
  setShowShortcutsModal: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
}

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorState>((set, get) => ({
  width: 1080,
  height: 1080,
  zoom: 1,
  backgroundColor: "#FFFFFF",
  activePresetName: "BLANK CANVAS",
  isGridVisible: false,
  isSnappingEnabled: true,

  selectedLayerIds: [],
  activeObjectProps: null,
  layers: [],

  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  showShortcutsModal: false,
  showExportModal: false,

  setCanvasSize: (width, height, presetName) => {
    set((state) => ({
      width,
      height,
      activePresetName: presetName || state.activePresetName,
    }));
  },

  setZoom: (zoom) => {
    set((state) => ({
      zoom: typeof zoom === "function" ? zoom(state.zoom) : zoom,
    }));
  },

  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setGridVisible: (visible) => set({ isGridVisible: visible }),
  setSnappingEnabled: (enabled) => set({ isSnappingEnabled: enabled }),

  setSelectedLayerIds: (ids) => set({ selectedLayerIds: ids }),
  setActiveObjectProps: (props) => set({ activeObjectProps: props }),

  setLayers: (layers) => set({ layers }),

  updateLayerMeta: (id, updates) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  },

  pushHistory: (step) => {
    const { history, historyIndex } = get();
    // Slice off future if we were in the middle of undo stack
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(step);

    // Keep up to MAX_HISTORY steps
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    const nextIndex = newHistory.length - 1;
    set({
      history: newHistory,
      historyIndex: nextIndex,
      canUndo: nextIndex > 0,
      canRedo: false,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return null;
    const nextIndex = historyIndex - 1;
    set({
      historyIndex: nextIndex,
      canUndo: nextIndex > 0,
      canRedo: nextIndex < history.length - 1,
    });
    return history[nextIndex] || null;
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return null;
    const nextIndex = historyIndex + 1;
    set({
      historyIndex: nextIndex,
      canUndo: true,
      canRedo: nextIndex < history.length - 1,
    });
    return history[nextIndex] || null;
  },

  resetHistory: (initialStep) => {
    set({
      history: [initialStep],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    });
  },

  setShowShortcutsModal: (show) => set({ showShortcutsModal: show }),
  setShowExportModal: (show) => set({ showExportModal: show }),
}));
