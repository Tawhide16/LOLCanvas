"use client";

import { loadGoogleFont } from "@/lib/googleFonts";

import React, { useRef, useEffect, useState } from "react";
import { CanvasLayer, Template } from "@/types";

interface CanvasStageProps {
  template: Template | null;
  backgroundImageUrl?: string | null;
  width: number;
  height: number;
  zoomLevel: number;
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayerPosition: (id: string, x: number, y: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function CanvasStage({
  template,
  backgroundImageUrl,
  width,
  height,
  zoomLevel,
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayerPosition,
  canvasRef,
}: CanvasStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragLayerId, setDragLayerId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [, setForceRedraw] = useState(0);

  const getImage = (src: string): HTMLImageElement => {
    let img = imageCacheRef.current.get(src);
    if (!img) {
      img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => {
        setForceRedraw((c) => c + 1);
      };
      imageCacheRef.current.set(src, img);
    }
    return img;
  };

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw Canvas Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderAllLayers = () => {
      // Sort layers by zIndex
      const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

      sortedLayers.forEach((layer) => {
        const pxX = (layer.x / 100) * canvas.width;
        const pxY = (layer.y / 100) * canvas.height;

        // A. TEXT LAYERS
        if (layer.type === "text" && layer.text) {
          ctx.save();
          const fontSize = layer.fontSize || 42;
          const fontFamily = layer.fontFamily || "Impact";
          const textToRender = layer.isUppercase ? layer.text.toUpperCase() : layer.text;

          loadGoogleFont(fontFamily, () => setForceRedraw((c) => c + 1));
          ctx.font = `900 ${fontSize}px "${fontFamily}", sans-serif`;
          ctx.textAlign = layer.align || "center";
          ctx.textBaseline = "middle";

          if (layer.rotation) {
            ctx.translate(pxX, pxY);
            ctx.rotate((layer.rotation * Math.PI) / 180);
            ctx.translate(-pxX, -pxY);
          }

          // Outline stroke
          if (layer.strokeWidth && layer.strokeWidth > 0 && layer.strokeColor) {
            ctx.strokeStyle = layer.strokeColor;
            ctx.lineWidth = layer.strokeWidth;
            ctx.lineJoin = "miter";
            ctx.miterLimit = 2;
            ctx.strokeText(textToRender, pxX, pxY);
          }

          // Fill text
          ctx.fillStyle = layer.color || "#000000";
          ctx.fillText(textToRender, pxX, pxY);

          // Selection box
          if (layer.id === selectedLayerId) {
            const metrics = ctx.measureText(textToRender);
            const boxWidth = metrics.width + 24;
            const boxHeight = fontSize + 16;
            ctx.strokeStyle = "#E11D48";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);

            let boxX = pxX - boxWidth / 2;
            if (layer.align === "left") boxX = pxX - 12;
            if (layer.align === "right") boxX = pxX - boxWidth + 12;

            ctx.strokeRect(boxX, pxY - boxHeight / 2, boxWidth, boxHeight);
            ctx.setLineDash([]);
          }
          ctx.restore();
        }

        // B. IMAGE OVERLAY LAYERS
        else if (layer.type === "image" && layer.imageUrl) {
          ctx.save();
          ctx.translate(pxX, pxY);

          const rot = layer.rotation || 0;
          if (rot !== 0) {
            ctx.rotate((rot * Math.PI) / 180);
          }

          const sc = layer.scale || 1.0;
          const fx = layer.flipX ? -1 : 1;
          const fy = layer.flipY ? -1 : 1;
          ctx.scale(sc * fx, sc * fy);

          if (layer.opacity !== undefined) {
            ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));
          }

          const imgW = layer.width || 240;
          const imgH = layer.height || 180;

          const img = getImage(layer.imageUrl);

          if (img.complete && img.naturalWidth > 0) {
            // Apply cropping parameters if configured
            const cropX = (layer.cropX || 0) / 100;
            const cropY = (layer.cropY || 0) / 100;
            const cropW = (layer.cropWidth || 100) / 100;
            const cropH = (layer.cropHeight || 100) / 100;

            const sx = cropX * img.naturalWidth;
            const sy = cropY * img.naturalHeight;
            const sw = cropW * img.naturalWidth;
            const sh = cropH * img.naturalHeight;

            ctx.drawImage(
              img,
              sx,
              sy,
              sw,
              sh,
              -imgW / 2,
              -imgH / 2,
              imgW,
              imgH
            );
          } else {
            // Placeholder rect while image loads
            ctx.fillStyle = "#E6E4DC";
            ctx.fillRect(-imgW / 2, -imgH / 2, imgW, imgH);
            // Image will trigger setForceRedraw once loaded in getImage()
          }

          // If selected, draw transform bounding box with corner anchors
          if (layer.id === selectedLayerId) {
            ctx.strokeStyle = "#E11D48";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.strokeRect(-imgW / 2 - 4, -imgH / 2 - 4, imgW + 8, imgH + 8);
            ctx.setLineDash([]);

            // Draw 4 corner handles
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1.5;
            const handleSize = 8;
            [
              [-imgW / 2 - 4, -imgH / 2 - 4],
              [imgW / 2 + 4, -imgH / 2 - 4],
              [-imgW / 2 - 4, imgH / 2 + 4],
              [imgW / 2 + 4, imgH / 2 + 4],
            ].forEach(([hx, hy]) => {
              ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
              ctx.strokeRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
            });
          }

          ctx.restore();
        }

        // C. STICKER BADGES
        else if (layer.type === "sticker" && layer.stickerSymbol) {
          ctx.save();
          ctx.translate(pxX, pxY);
          if (layer.rotation) {
            ctx.rotate((layer.rotation * Math.PI) / 180);
          }

          ctx.fillStyle = layer.color || "#000000";
          ctx.fillRect(-80, -25, 160, 50);
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 3;
          ctx.strokeRect(-76, -21, 152, 42);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "900 16px Space Mono, monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(layer.stickerSymbol, 0, 0);

          if (layer.id === selectedLayerId) {
            ctx.strokeStyle = "#E11D48";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(-85, -30, 170, 60);
            ctx.setLineDash([]);
          }

          ctx.restore();
        }
      });
    };

    // Check background image with instant cache
    const bgSrc = backgroundImageUrl || (template ? template.svgDataUri : null);

    if (bgSrc) {
      const bgImage = getImage(bgSrc);
      if (bgImage.complete && bgImage.naturalWidth > 0) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        renderAllLayers();
      } else {
        ctx.fillStyle = "#FAF9F5";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        renderAllLayers();
      }
    } else {
      renderAllLayers();
    }
  }, [width, height, template, backgroundImageUrl, layers, selectedLayerId]);

  // Handle Dragging layers directly on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    // Reverse z-index hit testing
    const sorted = [...layers].sort((a, b) => b.zIndex - a.zIndex);
    let hit: CanvasLayer | null = null;

    for (const layer of sorted) {
      // For image layer: test bounding box
      if (layer.type === "image") {
        const halfW = (((layer.width || 240) * (layer.scale || 1)) / (canvas.width * 2)) * 100;
        const halfH = (((layer.height || 180) * (layer.scale || 1)) / (canvas.height * 2)) * 100;
        if (
          mouseX >= layer.x - halfW &&
          mouseX <= layer.x + halfW &&
          mouseY >= layer.y - halfH &&
          mouseY <= layer.y + halfH
        ) {
          hit = layer;
          break;
        }
      } else {
        const dist = Math.hypot(layer.x - mouseX, layer.y - mouseY);
        if (dist < 15) {
          hit = layer;
          break;
        }
      }
    }

    if (hit) {
      onSelectLayer(hit.id);
      setIsDragging(true);
      setDragLayerId(hit.id);
      setDragOffset({ x: mouseX - hit.x, y: mouseY - hit.y });
    } else {
      onSelectLayer(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragLayerId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    let newX = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    let newY = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;

    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    onUpdateLayerPosition(dragLayerId, Math.round(newX), Math.round(newY));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragLayerId(null);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-[#E6E4DC] relative overflow-auto select-none"
    >
      {/* Background Architectural Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Centered Canvas Container with Dynamic Scaling */}
      <div
        className="relative transition-transform duration-150 ease-out flex items-center justify-center"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "center center",
        }}
      >
        <div className="relative border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[75vh] max-w-[85vw] flex items-center justify-center cursor-move">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="block max-h-[72vh] max-w-[80vw] object-contain"
            style={{
              aspectRatio: `${width}/${height}`,
            }}
          />
        </div>
      </div>

      {/* Floating Canvas Meta Tag */}
      <div className="absolute bottom-4 left-6 pointer-events-none font-mono-code text-[11px] text-[#555555] bg-[#FAF9F5]/90 px-3 py-1.5 border border-black/20 flex items-center gap-3">
        <span>CANVAS: {width} × {height} PX</span>
        <span>•</span>
        <span className="text-black font-bold">CLICK & DRAG ANY IMAGE OR TEXT</span>
      </div>
    </div>
  );
}
