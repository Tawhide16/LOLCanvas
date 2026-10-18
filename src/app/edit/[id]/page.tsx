import EditorClient from "@/components/editor/EditorClient";
import { Suspense, use } from "react";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
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
