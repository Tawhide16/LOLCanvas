"use client";

import dynamic from "next/dynamic";

const EditorClient = dynamic(() => import("@/components/editor/EditorClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[85vh] w-full bg-[#E6E4DC] flex items-center justify-center font-mono-code text-xs font-bold text-black select-none">
      <div className="p-6 bg-[#FAF9F5] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
        <span className="w-3 h-3 rounded-full bg-[#E11D48] animate-ping" />
        <span>INITIALIZING CANVAS MEME STUDIO...</span>
      </div>
    </div>
  ),
});

interface EditorClientWrapperProps {
  templateSlug?: string;
}

export default function EditorClientWrapper({ templateSlug = "blank-canvas" }: EditorClientWrapperProps) {
  return <EditorClient templateSlug={templateSlug} />;
}
