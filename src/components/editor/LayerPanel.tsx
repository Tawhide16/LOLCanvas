"use client";

import React, { useRef } from "react";
import { CanvasLayer } from "@/types";
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Plus,
  Type,
  Stamp,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

interface LayerPanelProps {
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onMoveLayerZ: (id: string, direction: "up" | "down") => void;
  onAddTextLayer: (initialText?: string, yPos?: number) => void;
  onAddImageLayer?: (imageUrl: string, name?: string) => void;
}

export default function LayerPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onMoveLayerZ,
  onAddTextLayer,
  onAddImageLayer,
}: LayerPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddImageLayer) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        onAddImageLayer(dataUri, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#FAF9F5] border-b border-black font-mono-code text-xs">
      {/* Panel Header */}
      <div className="p-3 bg-[#E6E4DC] border-b border-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-black" />
          <span className="font-bold text-black uppercase tracking-wider text-[11px]">
            ACTIVE LAYERS ({layers.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddTextLayer("NEW TEXT", 50)}
            className="flex items-center gap-1 px-2 py-1 bg-black text-white hover:bg-[#333333] transition-colors text-[10px] font-bold uppercase"
            title="Add Text Layer"
          >
            <Plus className="w-3 h-3" />
            TEXT
          </button>

          {onAddImageLayer && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-black text-black hover:bg-[#F6F5EE] transition-colors text-[10px] font-bold uppercase"
                title="Add Image Overlay on Top"
              >
                <ImageIcon className="w-3 h-3 text-[#E11D48]" />
                +IMAGE
              </button>
            </>
          )}
        </div>
      </div>

      {/* Layer List Items */}
      <div className="divide-y divide-black/15 max-h-[220px] overflow-y-auto">
        {sortedLayers.map((layer, index) => {
          const isSelected = layer.id === selectedLayerId;

          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                isSelected ? "bg-white border-l-4 border-l-[#E11D48]" : "hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {layer.type === "text" && (
                  <Type className="w-3.5 h-3.5 text-black shrink-0" />
                )}
                {layer.type === "image" && (
                  <div className="w-5 h-5 bg-[#FAF9F5] border border-black/30 shrink-0 flex items-center justify-center overflow-hidden">
                    {layer.imageUrl ? (
                      <img src={layer.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ImageIcon className="w-3 h-3 text-[#E11D48]" />
                    )}
                  </div>
                )}
                {layer.type === "sticker" && (
                  <Stamp className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
                )}

                <div className="truncate">
                  <span className="font-bold text-black block truncate text-[11px]">
                    {layer.type === "text"
                      ? layer.text || "(Empty Text)"
                      : layer.type === "image"
                      ? layer.imageName || "[IMAGE OVERLAY]"
                      : `[STAMP] ${layer.stickerSymbol}`}
                  </span>
                  <span className="text-[9px] text-[#777777]">
                    Z: {layer.zIndex} • ({layer.x}%, {layer.y}%)
                    {layer.rotation ? ` • ${layer.rotation}°` : ""}
                  </span>
                </div>
              </div>

              {/* Actions for layer */}
              <div
                className="flex items-center gap-1 shrink-0 ml-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onMoveLayerZ(layer.id, "up")}
                  disabled={index === 0}
                  className="p-1 hover:bg-[#E6E4DC] disabled:opacity-20"
                  title="Bring Forward"
                >
                  <ArrowUp className="w-3 h-3 text-black" />
                </button>
                <button
                  onClick={() => onMoveLayerZ(layer.id, "down")}
                  disabled={index === sortedLayers.length - 1}
                  className="p-1 hover:bg-[#E6E4DC] disabled:opacity-20"
                  title="Send Backward"
                >
                  <ArrowDown className="w-3 h-3 text-black" />
                </button>
                <button
                  onClick={() => onDuplicateLayer(layer.id)}
                  className="p-1 hover:bg-[#E6E4DC]"
                  title="Duplicate Layer"
                >
                  <Copy className="w-3 h-3 text-black" />
                </button>
                <button
                  onClick={() => onDeleteLayer(layer.id)}
                  className="p-1 hover:bg-black hover:text-white text-[#E11D48]"
                  title="Delete Layer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
