import type { Metadata } from "next";
import { Suspense, use } from "react";
import EditorClient from "@/components/editor/EditorClient";
import { TEMPLATES } from "@/lib/data";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const tpl = TEMPLATES.find((t) => t.slug === id || t.id === id);
  const name = tpl ? tpl.title : id.replace(/-/g, " ").toUpperCase();
  return {
    title: `Edit ${name} — Canvas Meme Studio | LOLCanvas`,
    description: `Customize ${name} meme format with in-browser layers, custom fonts, stickers, and export watermark-free high-res PNG.`,
  };
}


function EditorContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditorClient templateSlug={id} />;
}

export default function EditorPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#E6E4DC] flex items-center justify-center font-mono-code text-xs font-bold text-black">
          LOADING CANVAS EDITOR...
        </div>
      }
    >
      <EditorContent params={params} />
    </Suspense>
  );
}
