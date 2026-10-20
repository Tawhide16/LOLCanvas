"use client";

import React from "react";
import { X, Keyboard, Command } from "lucide-react";
import { useEditorStore } from "@/lib/editor/editorStore";

export default function ShortcutsModal() {
  const showShortcutsModal = useEditorStore((s) => s.showShortcutsModal);
  const setShowShortcutsModal = useEditorStore((s) => s.setShowShortcutsModal);

  if (!showShortcutsModal) return null;

  const SHORTCUTS = [
    { key: "Ctrl + Z", desc: "Undo (up to 50 steps)" },
    { key: "Ctrl + Shift + Z", desc: "Redo (or Ctrl + Y)" },
    { key: "Delete / Backspace", desc: "Delete selected object(s)" },
    { key: "Ctrl + D", desc: "Duplicate selection" },
    { key: "Ctrl + A", desc: "Select all objects" },
    { key: "Arrow Keys", desc: "Nudge selection by 1px" },
    { key: "Shift + Arrow", desc: "Nudge selection by 10px" },
    { key: "Shift + Resize", desc: "Lock aspect ratio" },
    { key: "Alt + Resize", desc: "Resize from center" },
    { key: "Esc", desc: "Deselect active objects" },
    { key: "Double Click", desc: "Edit text inline directly on canvas" },
    { key: "?", desc: "Toggle this shortcut cheat sheet" },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF9F5] border-2 border-black w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-mono-code">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black px-4 py-3 bg-[#E6E4DC]">
          <div className="flex items-center gap-2 font-bold text-black uppercase text-xs">
            <Keyboard className="w-4 h-4 text-[#E11D48]" />
            <span>KEYBOARD SHORTCUTS CHEAT SHEET</span>
          </div>
          <button
            type="button"
            onClick={() => setShowShortcutsModal(false)}
            className="p-1 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-2">
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between py-2 px-3 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
            >
              <span className="font-bold text-black">{s.desc}</span>
              <kbd className="px-2 py-0.5 bg-[#FAF9F5] border border-black text-[#E11D48] font-bold rounded-none text-[11px] uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FAF9F5] border-t-2 border-black flex justify-between items-center text-[11px] text-[#666666]">
          <span>PRO-TIP: Press <strong className="text-black">?</strong> anywhere to toggle</span>
          <button
            type="button"
            onClick={() => setShowShortcutsModal(false)}
            className="px-4 py-1.5 bg-black text-white hover:bg-[#E11D48] transition-colors font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            GOT IT [ESC]
          </button>
        </div>
      </div>
    </div>
  );
}
