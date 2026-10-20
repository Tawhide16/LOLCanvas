"use client";

import React, { useRef, useState } from "react";
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
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit2,
  Check,
  ChevronsUp,
  ChevronsDown,
  Layers2,
} from "lucide-react";
import { useEditorStore } from "@/lib/editor/editorStore";
import { fabricAdapter } from "@/lib/editor/fabricAdapter";
import { loadGoogleFont } from "@/lib/googleFonts";

interface LayerPanelProps {
  layers?: any[];
  selectedLayerId?: string | null;
  onSelectLayer?: (id: string) => void;
  onDeleteLayer?: (id: string) => void;
  onDuplicateLayer?: (id: string) => void;
  onMoveLayerZ?: (id: string, direction: "up" | "down") => void;
  onAddTextLayer?: (initialText?: string, yPos?: number) => void;
  onAddImageLayer?: (imageUrl: string, name?: string) => void;
}

export default function LayerPanel({
  onAddTextLayer,
  onAddImageLayer,
}: LayerPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layers = useEditorStore((s) => s.layers);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        if (onAddImageLayer) {
          onAddImageLayer(dataUri, file.name);
        } else {
          fabricAdapter.addImageLayer(dataUri, file.name);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddText = () => {
    if (onAddTextLayer) {
      onAddTextLayer("NEW CAPTION");
    } else {
      fabricAdapter.addTextLayer("NEW CAPTION");
    }
  };

  const handleStartRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    e?.preventDefault();
    if (editingName.trim()) {
      fabricAdapter.renameLayer(id, editingName.trim());
    }
    setEditingId(null);
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    fabricAdapter.reorderLayers(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  return (
    <div className="bg-[#FAF9F5] border-b border-black font-mono-code text-xs">
      {/* Panel Header */}
      <div className="p-3 bg-[#E6E4DC] border-b border-black flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-black" />
          <span className="font-bold text-black uppercase tracking-wider text-[11px]">
            LAYERS STACK ({layers.length})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              loadGoogleFont("Impact");
              fabricAdapter.addTextLayer("ENTER ENGLISH TEXT", { fontFamily: "Impact" });
            }}
            className="flex items-center gap-1 px-1.5 py-1 bg-black text-white hover:bg-[#333333] transition-colors text-[9px] font-bold uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
            title="Add English Text Layer"
          >
            <Plus className="w-2.5 h-2.5 text-[#FACC15]" />
            <span>+ ENG</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadGoogleFont("Hind Siliguri");
              fabricAdapter.addTextLayer("আপনার বাংলা ক্যাপশন", { fontFamily: "Hind Siliguri" });
            }}
            className="flex items-center gap-1 px-1.5 py-1 bg-[#E11D48] text-white hover:bg-black transition-colors text-[9px] font-bold uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
            title="Add Bangla Text Layer"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>+ বাংলা</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-1.5 py-1 bg-white border border-black text-black hover:bg-[#F6F5EE] transition-colors text-[9px] font-bold uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
            title="Add Image Overlay"
          >
            <ImageIcon className="w-2.5 h-2.5 text-[#E11D48]" />
            <span>+ IMG</span>
          </button>
        </div>
      </div>

      {/* Layer List Items */}
      <div className="divide-y divide-black/15 max-h-[250px] overflow-y-auto">
        {layers.length === 0 ? (
          <div className="p-4 text-center text-[#777777] text-[11px]">
            No layers on canvas. Add text or an image above!
          </div>
        ) : (
          layers.map((layer, index) => {
            const isSelected = selectedLayerIds.includes(layer.id);

            return (
              <div
                key={layer.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onClick={() => fabricAdapter.selectLayerById(layer.id)}
                className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors select-none ${
                  isSelected ? "bg-white border-l-4 border-l-[#E11D48]" : "hover:bg-white"
                } ${layer.locked ? "opacity-75 bg-[#F6F5EE]" : ""}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Layer Type Icon */}
                  {layer.type === "text" && <Type className="w-3.5 h-3.5 text-black shrink-0" />}
                  {layer.type === "image" && (
                    <div className="w-5 h-5 bg-[#FAF9F5] border border-black/30 shrink-0 flex items-center justify-center overflow-hidden">
                      {layer.previewUrl ? (
                        <img src={layer.previewUrl} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <ImageIcon className="w-3 h-3 text-[#E11D48]" />
                      )}
                    </div>
                  )}
                  {layer.type === "sticker" && <Stamp className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />}
                  {layer.type === "group" && <Layers2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}

                  {/* Title / Inline Rename */}
                  <div className="truncate flex-1">
                    {editingId === layer.id ? (
                      <form
                        onSubmit={(e) => handleSaveRename(layer.id, e)}
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          onBlur={() => handleSaveRename(layer.id)}
                          className="bg-white border border-black px-1.5 py-0.5 text-[11px] font-bold text-black uppercase w-full focus:outline-none"
                        />
                        <button type="submit" className="p-0.5 text-[#16A34A] hover:bg-black/10">
                          <Check className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <div
                        className="flex items-center gap-1 group/name"
                        onDoubleClick={(e) => handleStartRename(layer.id, layer.name, e)}
                      >
                        <span className="font-bold text-black block truncate text-[11px]">
                          {layer.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(layer.id, layer.name, e)}
                          className="opacity-0 group-hover/name:opacity-100 p-0.5 hover:text-[#E11D48] transition-opacity"
                          title="Rename layer"
                        >
                          <Edit2 className="w-2.5 h-2.5 text-[#777777]" />
                        </button>
                      </div>
                    )}
                    <span className="text-[9px] text-[#777777] block">
                      Z: {layer.zIndex} {layer.locked ? "• [LOCKED]" : ""} {!layer.visible ? "• [HIDDEN]" : ""}
                    </span>
                  </div>
                </div>

                {/* Actions for layer */}
                <div
                  className="flex items-center gap-0.5 shrink-0 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => fabricAdapter.toggleLayerVisibility(layer.id)}
                    className="p-1 hover:bg-[#E6E4DC] text-black"
                    title={layer.visible ? "Hide Layer" : "Show Layer"}
                  >
                    {layer.visible ? (
                      <Eye className="w-3 h-3 text-[#16A34A]" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-[#999999]" />
                    )}
                  </button>

                  {/* Lock Toggle */}
                  <button
                    type="button"
                    onClick={() => fabricAdapter.toggleLayerLock(layer.id)}
                    className="p-1 hover:bg-[#E6E4DC]"
                    title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                  >
                    {layer.locked ? (
                      <Lock className="w-3 h-3 text-[#E11D48]" />
                    ) : (
                      <Unlock className="w-3 h-3 text-[#999999]" />
                    )}
                  </button>

                  {/* Move Up/Down */}
                  <button
                    type="button"
                    onClick={() => {
                      if (index > 0) fabricAdapter.reorderLayers(index, index - 1);
                    }}
                    disabled={index === 0}
                    className="p-1 hover:bg-[#E6E4DC] disabled:opacity-20"
                    title="Bring Forward"
                  >
                    <ArrowUp className="w-3 h-3 text-black" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (index < layers.length - 1) fabricAdapter.reorderLayers(index, index + 1);
                    }}
                    disabled={index === layers.length - 1}
                    className="p-1 hover:bg-[#E6E4DC] disabled:opacity-20"
                    title="Send Backward"
                  >
                    <ArrowDown className="w-3 h-3 text-black" />
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => {
                      fabricAdapter.selectLayerById(layer.id);
                      fabricAdapter.duplicateSelected();
                    }}
                    className="p-1 hover:bg-[#E6E4DC]"
                    title="Duplicate Layer"
                  >
                    <Copy className="w-3 h-3 text-black" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => {
                      fabricAdapter.selectLayerById(layer.id);
                      fabricAdapter.deleteSelected();
                    }}
                    className="p-1 hover:bg-black hover:text-white text-[#E11D48] transition-colors"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Layer quick alignment & reordering bar */}
      {selectedLayerIds.length > 0 && (
        <div className="p-2 bg-[#FAF9F5] border-t border-black flex items-center justify-between text-[10px]">
          <span className="font-bold text-[#777777] uppercase">ALIGN CANVAS:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fabricAdapter.alignSelected("left")}
              className="px-1.5 py-0.5 bg-white border border-black hover:bg-black hover:text-white font-bold"
              title="Align Left"
            >
              L
            </button>
            <button
              type="button"
              onClick={() => fabricAdapter.alignSelected("center")}
              className="px-1.5 py-0.5 bg-white border border-black hover:bg-black hover:text-white font-bold"
              title="Align Center Horizontal"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => fabricAdapter.alignSelected("right")}
              className="px-1.5 py-0.5 bg-white border border-black hover:bg-black hover:text-white font-bold"
              title="Align Right"
            >
              R
            </button>
            <button
              type="button"
              onClick={() => fabricAdapter.alignSelected("middle")}
              className="px-1.5 py-0.5 bg-white border border-black hover:bg-black hover:text-white font-bold"
              title="Align Middle Vertical"
            >
              M
            </button>
            <span className="text-black/30">|</span>
            <button
              type="button"
              onClick={() => fabricAdapter.bringToFront()}
              className="p-1 bg-white border border-black hover:bg-black hover:text-white"
              title="Bring to Front"
            >
              <ChevronsUp className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={() => fabricAdapter.sendToBack()}
              className="p-1 bg-white border border-black hover:bg-black hover:text-white"
              title="Send to Back"
            >
              <ChevronsDown className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
