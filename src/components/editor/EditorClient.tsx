"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Share2,
  Video,
  Smile,
  Maximize2,
  UploadCloud,
  LogOut,
  Undo2,
  Redo2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Copy,
  Download,
  Check,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Image as ImageIcon,
  AlertCircle,
  X,
  Layers,
  ChevronRight,
  Sliders,
  Crop,
  RotateCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CanvasStage from "./CanvasStage";
import TextControls from "./TextControls";
import ImageControls from "./ImageControls";
import LayerPanel from "./LayerPanel";
import { TEMPLATES } from "@/lib/data";
import { SOCIAL_PRESETS, VIDEO_PRESETS, CanvasPreset } from "@/lib/editorPresets";
import { MEME_OVERLAYS, MemeOverlayItem } from "@/lib/memeOverlays";
import { CanvasLayer, Template } from "@/types";

interface EditorClientProps {
  templateSlug?: string;
}

type MainCategory = "social" | "video" | "meme" | "custom" | "upload";

export default function EditorClient({ templateSlug = "drake-hotline" }: EditorClientProps) {
  const router = useRouter();

  const initialTemplate =
    TEMPLATES.find((t) => t.slug === templateSlug || t.id === templateSlug) || TEMPLATES[0];

  const [activeCategory, setActiveCategory] = useState<MainCategory>("meme");
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(initialTemplate);
  const [activePresetName, setActivePresetName] = useState<string>(initialTemplate.title);
  const [canvasWidth, setCanvasWidth] = useState<number>(initialTemplate.width || 1080);
  const [canvasHeight, setCanvasHeight] = useState<number>(initialTemplate.height || 1080);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  // Custom size form state
  const [customWInput, setCustomWInput] = useState<string>("1080");
  const [customHInput, setCustomHInput] = useState<string>("1080");
  const [customUnit, setCustomUnit] = useState<string>("px");
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(false);
  const [customDimensionError, setCustomDimensionError] = useState<string | null>(null);

  // Uploaded assets state
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const overlayImageInputRef = useRef<HTMLInputElement>(null);

  // Initial layers generator
  const getInitialLayers = (tpl: Template | null): CanvasLayer[] => {
    if (!tpl) {
      return [
        {
          id: "layer-1",
          type: "text",
          text: "ADD YOUR CAPTION",
          fontFamily: "Impact",
          fontSize: 48,
          color: "#000000",
          strokeColor: "#FFFFFF",
          strokeWidth: 4,
          align: "center",
          isUppercase: true,
          x: 50,
          y: 50,
          zIndex: 1,
        },
      ];
    }
    return [
      {
        id: "layer-top",
        type: "text",
        text: tpl.defaultTopText || "TOP CAPTION HERE",
        fontFamily: "Impact",
        fontSize: 44,
        color: "#FFFFFF",
        strokeColor: "#000000",
        strokeWidth: 6,
        align: "center",
        isUppercase: true,
        x: 50,
        y: 12,
        zIndex: 1,
      },
      {
        id: "layer-bottom",
        type: "text",
        text: tpl.defaultBottomText || "BOTTOM CAPTION HERE",
        fontFamily: "Impact",
        fontSize: 44,
        color: "#FFFFFF",
        strokeColor: "#000000",
        strokeWidth: 6,
        align: "center",
        isUppercase: true,
        x: 50,
        y: 88,
        zIndex: 2,
      },
    ];
  };

  const [layers, setLayers] = useState<CanvasLayer[]>(() => getInitialLayers(initialTemplate));
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>("layer-top");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<CanvasLayer[][]>([getInitialLayers(initialTemplate)]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Export states
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Dynamically load custom or uploaded templates by id or slug
  useEffect(() => {
    if (!templateSlug) return;

    const found = TEMPLATES.find((t) => t.slug === templateSlug || t.id === templateSlug);
    if (found) {
      setCurrentTemplate(found);
      setActivePresetName(found.title);
      setCanvasWidth(found.width || 1080);
      setCanvasHeight(found.height || 1080);
      setCustomBgImage(null);
      return;
    }

    async function fetchCustomTemplate() {
      try {
        const res = await fetch(`/api/templates?id=${encodeURIComponent(templateSlug || '')}`);
        if (res.ok) {
          const json = await res.json();
          const tpl = json.data;
          if (tpl) {
            const bg = tpl.originalUrl || tpl.svgDataUri;
            const customTpl: Template = {
              id: tpl.id,
              slug: tpl.slug || tpl.id,
              index: "№ 0000",
              title: tpl.title || "CUSTOM MEME",
              categoryId: tpl.category || "classic",
              categoryName: (tpl.category || "classic").toUpperCase(),
              format: "classic",
              formatLabel: "Custom Format",
              remixCount: tpl.downloads || 100,
              downloadCount: tpl.downloads || 50,
              createdAt: tpl.createdAt || new Date().toISOString(),
              source: "Community Upload",
              license: "Free to remix",
              aspectRatio: `${tpl.width || 1080}:${tpl.height || 1080}`,
              width: tpl.width || 1080,
              height: tpl.height || 1080,
              defaultTopText: tpl.defaultTopText || "",
              defaultBottomText: tpl.defaultBottomText || "",
              svgDataUri: tpl.svgDataUri || bg,
              originalUrl: tpl.originalUrl || bg,
              isWatermarkFree: true,
              tags: tpl.tags || [],
            };
            setCurrentTemplate(customTpl);
            setCustomBgImage(bg);
            setActivePresetName(customTpl.title);
            if (tpl.width) setCanvasWidth(tpl.width);
            if (tpl.height) setCanvasHeight(tpl.height);
          }
        }
      } catch (e) {
        console.warn("Could not load custom template:", e);
      }
    }
    fetchCustomTemplate();
  }, [templateSlug]);

  const pushHistory = (newLayers: CanvasLayer[]) => {
    const sliced = history.slice(0, historyIndex + 1);
    setHistory([...sliced, newLayers]);
    setHistoryIndex(sliced.length);
    setHasUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setLayers(prev);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setLayers(next);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleResetLayers = () => {
    const reset = getInitialLayers(currentTemplate);
    setLayers(reset);
    setSelectedLayerId(reset[0]?.id || null);
    pushHistory(reset);
  };

  // Preset Selection Handlers
  const handleSelectPreset = (preset: CanvasPreset) => {
    setCanvasWidth(preset.width);
    setCanvasHeight(preset.height);
    setActivePresetName(preset.name);
    setCustomWInput(preset.width.toString());
    setCustomHInput(preset.height.toString());
    setHasUnsavedChanges(true);
  };

  const handleSelectMemeTemplate = (template: Template) => {
    setCurrentTemplate(template);
    setCustomBgImage(null);
    setCanvasWidth(template.width);
    setCanvasHeight(template.height);
    setActivePresetName(template.title);
    const newLayers = getInitialLayers(template);
    setLayers(newLayers);
    setSelectedLayerId(newLayers[0]?.id || null);
    pushHistory(newLayers);
  };

  const handleBlankMemeCanvas = () => {
    setCurrentTemplate(null);
    setCustomBgImage(null);
    setCanvasWidth(1080);
    setCanvasHeight(1080);
    setActivePresetName("BLANK MEME CANVAS");
    const newLayers = getInitialLayers(null);
    setLayers(newLayers);
    setSelectedLayerId(newLayers[0]?.id || null);
    pushHistory(newLayers);
  };

  // Custom Size Creation
  const handleCreateCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCustomDimensionError(null);

    const w = parseInt(customWInput, 10);
    const h = parseInt(customHInput, 10);

    if (isNaN(w) || isNaN(h)) {
      setCustomDimensionError("Please enter valid numerical dimensions.");
      return;
    }

    if (w < 50 || w > 8000 || h < 50 || h > 8000) {
      setCustomDimensionError("Width and Height must be between 50px and 8000px.");
      return;
    }

    setCanvasWidth(w);
    setCanvasHeight(h);
    setActivePresetName(`CUSTOM (${w}×${h} PX)`);
    setHasUnsavedChanges(true);
  };

  // Upload handler for background or library
  const handleFileUpload = (file: File, asBackground = true) => {
    const valid = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!valid.includes(file.type)) {
      alert("Please upload a PNG, JPG, WebP, or SVG image.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      if (dataUri) {
        setUploadedAssets((prev) => [dataUri, ...prev]);
        if (asBackground) {
          setCustomBgImage(dataUri);
          setActivePresetName(`UPLOAD: ${file.name.slice(0, 15)}`);
        } else {
          // Add as image overlay layer on top
          handleAddImageLayer(dataUri, file.name);
        }
        setHasUnsavedChanges(true);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Layer Mutations
  const handleUpdateLayer = (id: string, updates: Partial<CanvasLayer>) => {
    const updated = layers.map((layer) =>
      layer.id === id ? { ...layer, ...updates } : layer
    );
    setLayers(updated);
    pushHistory(updated);
  };

  const handleUpdateLayerPosition = (id: string, x: number, y: number) => {
    const updated = layers.map((layer) =>
      layer.id === id ? { ...layer, x, y } : layer
    );
    setLayers(updated);
    setHasUnsavedChanges(true);
  };

  // ADD AN IMAGE OVERLAY ON TOP OF ANY IMAGE
  const handleAddImageLayer = (
    imageUrl: string,
    name = "Overlay Image",
    width = 240,
    height = 180
  ) => {
    const newId = `img-layer-${Date.now()}`;
    const maxZ = layers.length > 0 ? Math.max(...layers.map((l) => l.zIndex)) : 0;
    const newLayer: CanvasLayer = {
      id: newId,
      type: "image",
      imageUrl,
      imageName: name,
      width,
      height,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0,
      flipX: false,
      flipY: false,
      cropX: 0,
      cropY: 0,
      cropWidth: 100,
      cropHeight: 100,
      x: 50,
      y: 50,
      zIndex: maxZ + 1,
    };
    const updated = [...layers, newLayer];
    setLayers(updated);
    setSelectedLayerId(newId);
    pushHistory(updated);
  };

  const handleAddTextLayer = (initialText = "NEW CAPTION", yPos = 50) => {
    const newId = `layer-${Date.now()}`;
    const maxZ = layers.length > 0 ? Math.max(...layers.map((l) => l.zIndex)) : 0;
    const newLayer: CanvasLayer = {
      id: newId,
      type: "text",
      text: initialText,
      fontFamily: "Impact",
      fontSize: 44,
      color: "#FFFFFF",
      strokeColor: "#000000",
      strokeWidth: 6,
      align: "center",
      isUppercase: true,
      x: 50,
      y: yPos,
      zIndex: maxZ + 1,
    };
    const updated = [...layers, newLayer];
    setLayers(updated);
    setSelectedLayerId(newId);
    pushHistory(updated);
  };

  const handleAddSticker = (symbol: string) => {
    const newId = `sticker-${Date.now()}`;
    const maxZ = layers.length > 0 ? Math.max(...layers.map((l) => l.zIndex)) : 0;
    const newLayer: CanvasLayer = {
      id: newId,
      type: "sticker",
      stickerSymbol: symbol,
      color: "#E11D48",
      x: 75,
      y: 25,
      rotation: -10,
      zIndex: maxZ + 1,
    };
    const updated = [...layers, newLayer];
    setLayers(updated);
    setSelectedLayerId(newId);
    pushHistory(updated);
  };

  const handleDeleteLayer = (id: string) => {
    const updated = layers.filter((l) => l.id !== id);
    setLayers(updated);
    if (selectedLayerId === id) setSelectedLayerId(null);
    pushHistory(updated);
  };

  const handleDuplicateLayer = (id: string) => {
    const source = layers.find((l) => l.id === id);
    if (!source) return;
    const maxZ = Math.max(...layers.map((l) => l.zIndex));
    const duplicate: CanvasLayer = {
      ...source,
      id: `layer-${Date.now()}`,
      x: Math.min(95, source.x + 4),
      y: Math.min(95, source.y + 4),
      zIndex: maxZ + 1,
    };
    const updated = [...layers, duplicate];
    setLayers(updated);
    setSelectedLayerId(duplicate.id);
    pushHistory(updated);
  };

  const handleMoveLayerZ = (id: string, direction: "up" | "down") => {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    const newZ = direction === "up" ? layer.zIndex + 1 : Math.max(1, layer.zIndex - 1);
    const updated = layers.map((l) => (l.id === id ? { ...l, zIndex: newZ } : l));
    setLayers(updated);
    pushHistory(updated);
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.0, +(z + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.4, +(z - 0.15).toFixed(2)));
  const handleZoomReset = () => setZoomLevel(1);

  // Export actions
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSelectedLayerId(null);

    setTimeout(() => {
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `lolcanvas-${activePresetName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }, 100);
  };

  const handleCopyToClipboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSelectedLayerId(null);
    setTimeout(() => {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 2500);
        } catch {
          handleExportPNG();
        }
      }, "image/png");
    }, 100);
  };

  // Upload & Save to Community Profile
  const handleUploadToCommunity = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSelectedLayerId(null);
    setIsPublishing(true);
    setPublishSuccess(null);

    setTimeout(async () => {
      try {
        const dataUrl = canvas.toDataURL("image/png", 0.95);

        let authorEmail = "creator@lolcanvas.studio";
        try {
          const local = localStorage.getItem("lolcanvas_user");
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed.email) authorEmail = parsed.email;
          }
        } catch (e) {}

        const res = await fetch("/api/memes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: activePresetName.toUpperCase(),
            previewUrl: dataUrl,
            layers: layers,
            width: canvasWidth,
            height: canvasHeight,
            isPublic: true,
            authorEmail: authorEmail,
          }),
        });

        if (res.ok) {
          setPublishSuccess("SAVED TO PROFILE!");
          setTimeout(() => setPublishSuccess(null), 3500);
        } else {
          alert("Failed to save meme. Please try again.");
        }
      } catch (err) {
        console.error("Meme save error:", err);
      } finally {
        setIsPublishing(false);
      }
    }, 120);
  };

  // Exit Editor
  const handleExitClick = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirmModal(true);
    } else {
      router.push("/");
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirmModal(false);
    router.push("/");
  };

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen overflow-hidden bg-[#FAF9F5] flex flex-col text-black font-body select-none">
      {/* 1. TOP HEADER BAR */}
      <header className="w-full h-14 bg-white border-b border-black flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 font-mono-code text-xs">
        {/* Left: Brand + Active Preset Badge */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Return to LOLCanvas Home"
          >
            <img
              src="/logo-icon.png"
              alt="LOLCanvas Icon"
              className="w-6 h-6 object-contain"
            />
            <span className="font-display font-extrabold text-base tracking-tight text-black">
              LOLCANVAS<span className="text-[10px] align-super">®</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 border-l border-black/20 pl-4">
            <span className="text-[#777777] uppercase text-[11px]">WORKSPACE:</span>
            <span className="font-bold text-black uppercase truncate max-w-[200px]">
              {activePresetName}
            </span>
            <span className="bg-[#E6E4DC] text-black px-2 py-0.5 text-[10px] font-bold border border-black/30">
              {canvasWidth} × {canvasHeight} PX
            </span>
          </div>
        </div>

        {/* Center: History & Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* Undo / Redo */}
          <div className="flex items-center border border-black divide-x divide-black bg-white">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 hover:bg-[#F6F5EE] disabled:opacity-20 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5 text-black" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 hover:bg-[#F6F5EE] disabled:opacity-20 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5 text-black" />
            </button>
            <button
              onClick={handleResetLayers}
              className="p-1.5 hover:bg-[#F6F5EE] text-[#E11D48] transition-colors"
              title="Reset Layers"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center border border-black divide-x divide-black bg-white text-[11px]">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-[#F6F5EE]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5 text-black" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2.5 py-1 font-bold hover:bg-[#F6F5EE]"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-[#F6F5EE]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>

        {/* Right: Export & Exit Editor */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyToClipboard}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black hover:bg-[#F6F5EE] font-bold uppercase transition-all"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY</span>
              </>
            )}
          </button>

          {/* 1. DOWNLOAD PNG (Watermark-free) */}
          <button
            onClick={handleExportPNG}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-white border border-black text-black hover:bg-[#F6F5EE] font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
            title="Download watermark-free PNG"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981]">DOWNLOADED!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-black" />
                <span>DOWNLOAD PNG</span>
              </>
            )}
          </button>

          {/* 2. UPLOAD & SAVE TO COMMUNITY / PROFILE */}
          <button
            onClick={handleUploadToCommunity}
            disabled={isPublishing}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-black text-white hover:bg-[#222222] font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] disabled:opacity-50 text-xs"
            title="Upload and save to your profile & community archive"
          >
            {publishSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981]">SAVED!</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>{isPublishing ? "SAVING..." : "UPLOAD & SAVE"}</span>
              </>
            )}
          </button>

          {/* EXIT EDITOR BUTTON */}
          <button
            onClick={handleExitClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] border border-black text-black hover:bg-[#E11D48] hover:text-white uppercase font-bold transition-colors ml-1"
            title="Exit full-screen editor"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>EXIT EDITOR</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN BODY (SIDEBAR RAIL + CATEGORY DRAWER + CENTRAL WORKSPACE) */}
      <div className="flex-1 w-full flex items-stretch overflow-hidden relative">
        {/* A. PRIMARY VERTICAL CATEGORY RAIL (Exactly 5 categories in order) */}
        <aside className="w-20 md:w-24 bg-white border-r border-black flex flex-col justify-between shrink-0 z-20 py-3">
          <div className="flex flex-col items-stretch space-y-1">
            {/* Category 1: Social Media */}
            <button
              onClick={() => setActiveCategory("social")}
              className={`flex flex-col items-center justify-center py-3.5 px-1 relative transition-colors ${
                activeCategory === "social"
                  ? "bg-[#FAF9F5] text-black font-bold"
                  : "text-[#666666] hover:text-black hover:bg-[#F6F5EE]"
              }`}
            >
              {activeCategory === "social" && (
                <motion.div
                  layoutId="active-sidebar-pill"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#E11D48]"
                />
              )}
              <Share2 className="w-5 h-5 mb-1.5" />
              <span className="font-mono-code text-[10px] uppercase text-center leading-tight">
                SOCIAL MEDIA
              </span>
            </button>

            {/* Category 2: Video */}
            <button
              onClick={() => setActiveCategory("video")}
              className={`flex flex-col items-center justify-center py-3.5 px-1 relative transition-colors ${
                activeCategory === "video"
                  ? "bg-[#FAF9F5] text-black font-bold"
                  : "text-[#666666] hover:text-black hover:bg-[#F6F5EE]"
              }`}
            >
              {activeCategory === "video" && (
                <motion.div
                  layoutId="active-sidebar-pill"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#E11D48]"
                />
              )}
              <Video className="w-5 h-5 mb-1.5" />
              <span className="font-mono-code text-[10px] uppercase text-center leading-tight">
                VIDEO
              </span>
            </button>

            {/* Category 3: Meme Edit */}
            <button
              onClick={() => setActiveCategory("meme")}
              className={`flex flex-col items-center justify-center py-3.5 px-1 relative transition-colors ${
                activeCategory === "meme"
                  ? "bg-[#FAF9F5] text-black font-bold"
                  : "text-[#666666] hover:text-black hover:bg-[#F6F5EE]"
              }`}
            >
              {activeCategory === "meme" && (
                <motion.div
                  layoutId="active-sidebar-pill"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#E11D48]"
                />
              )}
              <Smile className="w-5 h-5 mb-1.5" />
              <span className="font-mono-code text-[10px] uppercase text-center leading-tight">
                MEME EDIT
              </span>
            </button>

            {/* Category 4: Custom Size */}
            <button
              onClick={() => setActiveCategory("custom")}
              className={`flex flex-col items-center justify-center py-3.5 px-1 relative transition-colors ${
                activeCategory === "custom"
                  ? "bg-[#FAF9F5] text-black font-bold"
                  : "text-[#666666] hover:text-black hover:bg-[#F6F5EE]"
              }`}
            >
              {activeCategory === "custom" && (
                <motion.div
                  layoutId="active-sidebar-pill"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#E11D48]"
                />
              )}
              <Maximize2 className="w-5 h-5 mb-1.5" />
              <span className="font-mono-code text-[10px] uppercase text-center leading-tight">
                CUSTOM SIZE
              </span>
            </button>

            {/* Category 5: Upload */}
            <button
              onClick={() => setActiveCategory("upload")}
              className={`flex flex-col items-center justify-center py-3.5 px-1 relative transition-colors ${
                activeCategory === "upload"
                  ? "bg-[#FAF9F5] text-black font-bold"
                  : "text-[#666666] hover:text-black hover:bg-[#F6F5EE]"
              }`}
            >
              {activeCategory === "upload" && (
                <motion.div
                  layoutId="active-sidebar-pill"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#E11D48]"
                />
              )}
              <UploadCloud className="w-5 h-5 mb-1.5" />
              <span className="font-mono-code text-[10px] uppercase text-center leading-tight">
                UPLOAD
              </span>
            </button>
          </div>

          {/* Bottom Brand Stamp */}
          <div className="text-center font-mono-code text-[9px] text-[#888888]">
            V2.4 PRO
          </div>
        </aside>

        {/* B. SECONDARY CATEGORY PANEL (Custom Size, Presets, Meme Tools, Upload) */}
        <aside className="w-80 sm:w-96 bg-[#FAF9F5] border-r border-black flex flex-col justify-between overflow-y-auto shrink-0 z-10 font-mono-code text-xs">
          <div className="divide-y divide-black/20">
            {/* Panel Header */}
            <div className="p-4 bg-white border-b border-black flex items-center justify-between">
              <span className="font-display font-extrabold text-sm uppercase text-black">
                {activeCategory === "social" && "SOCIAL MEDIA PRESETS"}
                {activeCategory === "video" && "VIDEO CANVAS PRESETS"}
                {activeCategory === "meme" && "MEME WORKBENCH & TEMPLATES"}
                {activeCategory === "custom" && "CUSTOM CANVAS DIMENSIONS"}
                {activeCategory === "upload" && "ASSET INGESTION"}
              </span>
            </div>

            {/* 1. SOCIAL MEDIA PANEL */}
            {activeCategory === "social" && (
              <div className="p-4 space-y-2.5">
                <p className="text-[11px] text-[#666666] mb-3">
                  Select a platform preset to automatically format the canvas:
                </p>
                {SOCIAL_PRESETS.map((preset) => {
                  const isActive =
                    canvasWidth === preset.width && canvasHeight === preset.height;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full p-3 border text-left flex items-center justify-between transition-all ${
                        isActive
                          ? "bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ring-1 ring-black"
                          : "bg-white border-black/20 hover:border-black hover:bg-[#F6F5EE]"
                      }`}
                    >
                      <div>
                        <div className="font-display font-bold text-xs uppercase text-black">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-[#777777] mt-0.5">
                          {preset.width} × {preset.height} px • {preset.aspectLabel}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-black" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. VIDEO PANEL */}
            {activeCategory === "video" && (
              <div className="p-4 space-y-2.5">
                <p className="text-[11px] text-[#666666] mb-3">
                  Video-oriented aspect ratio formats and canvas layouts:
                </p>
                {VIDEO_PRESETS.map((preset) => {
                  const isActive =
                    canvasWidth === preset.width && canvasHeight === preset.height;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full p-3 border text-left flex items-center justify-between transition-all ${
                        isActive
                          ? "bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ring-1 ring-black"
                          : "bg-white border-black/20 hover:border-black hover:bg-[#F6F5EE]"
                      }`}
                    >
                      <div>
                        <div className="font-display font-bold text-xs uppercase text-black">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-[#777777] mt-0.5">
                          {preset.width} × {preset.height} px • {preset.aspectLabel}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-black" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. MEME EDIT PANEL (IMAGE OVERLAYS + TEXT + LAYERS) */}
            {activeCategory === "meme" && (
              <div>
                {/* 1-Click Multi-Image Overlay Ingestion */}
                <div className="p-4 bg-white border-b border-black space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-[#777777] uppercase">
                      MULTI-IMAGE OVERLAY
                    </span>
                    <span className="text-[9px] text-[#10B981] font-bold">MOVE • CROP • ROTATE</span>
                  </div>

                  {/* Hidden file input for adding image overlay on top */}
                  <input
                    ref={overlayImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, false);
                    }}
                    className="hidden"
                  />

                  <button
                    onClick={() => overlayImageInputRef.current?.click()}
                    className="w-full py-2.5 px-3 bg-black text-white hover:bg-[#333333] uppercase font-bold text-center transition-all shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] flex items-center justify-center gap-2 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + ADD IMAGE ON TOP OF MEME
                  </button>

                  {/* Quick Preset Meme Overlay Stickers */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] text-[#777777] uppercase block">
                      QUICK OVERLAYS & CUTOUTS (CLICK TO ADD):
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {MEME_OVERLAYS.map((overlay) => (
                        <button
                          key={overlay.id}
                          onClick={() =>
                            handleAddImageLayer(
                              overlay.imageUrl,
                              overlay.name,
                              overlay.defaultWidth,
                              overlay.defaultHeight
                            )
                          }
                          className="p-1.5 bg-[#FAF9F5] border border-black/20 hover:border-black hover:bg-white transition-all flex flex-col items-center justify-center aspect-square"
                          title={`Add ${overlay.name}`}
                        >
                          <img
                            src={overlay.imageUrl}
                            alt={overlay.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Popular Meme Templates Gallery */}
                <div className="p-4 border-b border-black space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#777777] uppercase">
                      CHANGE BASE MEME
                    </span>
                    <button
                      onClick={handleBlankMemeCanvas}
                      className="text-[10px] font-bold text-[#E11D48] hover:underline uppercase"
                    >
                      BLANK CANVAS
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto">
                    {TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => handleSelectMemeTemplate(tpl)}
                        className={`p-2 border text-left flex flex-col justify-between transition-all ${
                          currentTemplate?.id === tpl.id
                            ? "bg-white border-black ring-2 ring-black"
                            : "bg-white border-black/20 hover:border-black hover:bg-[#F6F5EE]"
                        }`}
                      >
                        <div className="aspect-[4/3] bg-[#FAF9F5] border border-black/15 p-1 mb-1 flex items-center justify-center overflow-hidden">
                          <img
                            src={tpl.svgDataUri}
                            alt={tpl.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="font-display font-bold text-[10px] uppercase truncate block">
                          {tpl.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DYNAMIC LAYER CONTROLS (IMAGE VS TEXT) */}
                {selectedLayer?.type === "image" ? (
                  /* Dedicated Full-Feature Image Controls: Move, Crop, Rotate, Scale, Flip */
                  <ImageControls
                    selectedLayer={selectedLayer}
                    onUpdateLayer={handleUpdateLayer}
                    onDeleteLayer={handleDeleteLayer}
                    onDuplicateLayer={handleDuplicateLayer}
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                  />
                ) : (
                  /* Text & Caption Controls */
                  <TextControls
                    selectedLayer={selectedLayer}
                    onUpdateLayer={handleUpdateLayer}
                    onAddTextLayer={handleAddTextLayer}
                    onAddSticker={handleAddSticker}
                  />
                )}

                {/* Layer Management List */}
                <LayerPanel
                  layers={layers}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={setSelectedLayerId}
                  onDeleteLayer={handleDeleteLayer}
                  onDuplicateLayer={handleDuplicateLayer}
                  onMoveLayerZ={handleMoveLayerZ}
                  onAddTextLayer={handleAddTextLayer}
                  onAddImageLayer={(url, name) => handleAddImageLayer(url, name)}
                />
              </div>
            )}

            {/* 4. CUSTOM SIZE PANEL */}
            {activeCategory === "custom" && (
              <div className="p-5 space-y-5">
                <form onSubmit={handleCreateCustomSize} className="space-y-4">
                  <div className="text-[11px] text-[#666666]">
                    Set custom pixel dimensions for your active canvas:
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#777777] uppercase">
                        WIDTH ({customUnit})
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="8000"
                        value={customWInput}
                        onChange={(e) => setCustomWInput(e.target.value)}
                        className="w-full p-2.5 bg-white border border-black font-bold text-sm text-black focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#777777] uppercase">
                        HEIGHT ({customUnit})
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="8000"
                        value={customHInput}
                        onChange={(e) => setCustomHInput(e.target.value)}
                        className="w-full p-2.5 bg-white border border-black font-bold text-sm text-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span>UNITS:</span>
                      <select
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        className="bg-white border border-black px-2 py-1 font-bold text-xs"
                      >
                        <option value="px">PX (PIXELS)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLockAspectRatio(!lockAspectRatio)}
                      className={`flex items-center gap-1.5 px-2 py-1 border text-[10px] font-bold uppercase ${
                        lockAspectRatio ? "bg-black text-white border-black" : "bg-white border-black/30"
                      }`}
                    >
                      {lockAspectRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span>RATIO</span>
                    </button>
                  </div>

                  {customDimensionError && (
                    <div className="p-2.5 bg-[#FFF1F2] border border-[#E11D48] text-[#E11D48] text-[11px] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{customDimensionError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-black text-white hover:bg-[#333333] uppercase font-bold tracking-wider text-xs transition-all shadow-[2px_2px_0px_0px_rgba(225,29,72,1)]"
                  >
                    CREATE CANVAS ■
                  </button>
                </form>

                {/* Popular Layouts Section */}
                <div className="pt-4 border-t border-black/15 space-y-2.5">
                  <div className="text-[10px] font-bold text-[#777777] uppercase">
                    POPULAR RATIO LAYOUTS
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Square Post", w: 1080, h: 1080, label: "1:1" },
                      { name: "Landscape HD", w: 1920, h: 1080, label: "16:9" },
                      { name: "Story / Reels", w: 1080, h: 1920, label: "9:16" },
                      { name: "Standard Photo", w: 1200, h: 900, label: "4:3" },
                      { name: "Portrait Feed", w: 1080, h: 1350, label: "4:5" },
                      { name: "Header Banner", w: 1200, h: 400, label: "3:1" },
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setCustomWInput(item.w.toString());
                          setCustomHInput(item.h.toString());
                          setCanvasWidth(item.w);
                          setCanvasHeight(item.h);
                          setActivePresetName(item.name.toUpperCase());
                          setHasUnsavedChanges(true);
                        }}
                        className="p-2.5 bg-white border border-black/20 hover:border-black hover:bg-[#F6F5EE] text-left transition-all"
                      >
                        <span className="font-display font-bold text-[11px] uppercase block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-[#777777] block">
                          {item.w}×{item.h} • {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. UPLOAD PANEL */}
            {activeCategory === "upload" && (
              <div className="p-5 space-y-5">
                <div>
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)}
                    className="hidden"
                  />

                  <div
                    onClick={() => uploadInputRef.current?.click()}
                    className="border-2 border-dashed border-black/40 hover:border-black p-6 bg-white hover:bg-[#F6F5EE] cursor-pointer text-center space-y-2 transition-colors"
                  >
                    <UploadCloud className="w-8 h-8 text-black mx-auto" />
                    <div className="font-bold uppercase text-xs text-black">
                      {isUploading ? "UPLOADING ASSET..." : "CLICK OR DRAG IMAGE HERE"}
                    </div>
                    <div className="text-[10px] text-[#777777]">
                      PNG, JPG, WebP, SVG
                    </div>
                  </div>
                </div>

                {/* Uploaded Assets Library with 2 options: Base Background OR Layer on Top */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-[#777777] uppercase flex items-center justify-between">
                    <span>UPLOADED ASSETS</span>
                    <span>{uploadedAssets.length} ASSETS</span>
                  </div>

                  {uploadedAssets.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                      {uploadedAssets.map((asset, index) => (
                        <div
                          key={index}
                          className="group relative border border-black bg-white p-2 flex flex-col justify-between"
                        >
                          <div className="aspect-square flex items-center justify-center overflow-hidden bg-[#FAF9F5] mb-2">
                            <img src={asset} alt="Asset" className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[9px] font-bold">
                            <button
                              onClick={() => {
                                setCustomBgImage(asset);
                                setCurrentTemplate(null);
                                setHasUnsavedChanges(true);
                              }}
                              className="py-1 bg-white border border-black hover:bg-[#F6F5EE] text-black uppercase text-center"
                              title="Set as base canvas background"
                            >
                              AS BG
                            </button>
                            <button
                              onClick={() => {
                                handleAddImageLayer(asset, `Overlay ${index + 1}`);
                              }}
                              className="py-1 bg-black text-white hover:bg-[#333333] uppercase text-center"
                              title="Add on top of canvas as movable layer"
                            >
                              +ON TOP
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-white border border-black/20 text-center text-[#777777] text-[11px]">
                      No uploads yet. Import an image above to use as background or layer.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* C. CENTRAL CANVAS WORKSPACE AREA */}
        <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-[#E6E4DC]">
          <CanvasStage
            template={currentTemplate}
            backgroundImageUrl={customBgImage}
            width={canvasWidth}
            height={canvasHeight}
            zoomLevel={zoomLevel}
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayerPosition={handleUpdateLayerPosition}
            canvasRef={canvasRef}
          />
        </main>
      </div>

      {/* 3. CONFIRMATION MODAL ON EXIT */}
      <AnimatePresence>
        {showExitConfirmModal && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FAF9F5] border-2 border-black p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5 font-mono-code"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#E11D48] text-white flex items-center justify-center font-bold">
                  !
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg uppercase tracking-tight text-black">
                    EXIT CANVAS EDITOR?
                  </h3>
                  <span className="text-[11px] text-[#777777]">UNSAVED MODIFICATIONS DETECTED</span>
                </div>
              </div>

              <p className="text-xs text-[#555555] leading-relaxed">
                You have active edits on your canvas. Exiting now will return you to the website
                without preserving this session’s layer stack.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowExitConfirmModal(false)}
                  className="py-3 px-4 bg-black text-white hover:bg-[#333333] font-bold uppercase text-xs transition-all shadow-[2px_2px_0px_0px_rgba(225,29,72,1)]"
                >
                  CONTINUE EDITING
                </button>
                <button
                  onClick={handleConfirmExit}
                  className="py-3 px-4 bg-white border border-black hover:bg-[#F6F5EE] text-[#E11D48] font-bold uppercase text-xs transition-colors"
                >
                  EXIT WITHOUT SAVING
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
