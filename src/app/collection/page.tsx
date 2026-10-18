import type { Metadata } from "next";
import CollectionClient from "@/components/collection/CollectionClient";
import { getTemplates } from "@/modules/templates/template.service";
import { Template } from "@/types";

export const instant = false;

export const metadata: Metadata = {
  title: "Categories Index — LOLCanvas® | Curated Meme Taxonomies & Community References",
  description:
    "Explore curated meme categories, community-uploaded reference templates, and suggested card formats ready for immediate canvas editing.",
};

export default async function CollectionPage() {
  let initialTemplates: Template[] = [];
  try {
    const result = await getTemplates({
      category: "all",
      search: "",
      page: 1,
      limit: 100,
    });
    if (result && Array.isArray((result as any).templates)) {
      initialTemplates = (result as any).templates;
    }
  } catch (err) {
    console.warn("Could not pre-fetch templates for collection page:", err);
  }

  return <CollectionClient initialTemplates={initialTemplates} />;
}

