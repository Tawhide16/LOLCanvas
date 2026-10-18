import type { Metadata } from "next";
import CollectionClient from "@/components/collection/CollectionClient";

export const metadata: Metadata = {
  title: "Categories Index — LOLCanvas® | Curated Meme Taxonomies & Community References",
  description:
    "Explore curated meme categories, community-uploaded reference templates, and suggested card formats ready for immediate canvas editing.",
};

export default function CollectionPage() {
  return <CollectionClient />;
}

