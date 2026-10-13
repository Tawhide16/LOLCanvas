import EditorClient from "@/components/editor/EditorClient";
import { TEMPLATES } from "@/lib/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({
    id: t.slug,
  }));
}

export default async function EditorPage({ params }: PageProps) {
  const { id } = await params;
  return <EditorClient templateSlug={id} />;
}
