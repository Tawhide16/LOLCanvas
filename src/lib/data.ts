import { Category, Template } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "01",
    number: "01",
    slug: "funny-comedy",
    name: "Funny & Comedy",
    description: "Punchy, fast-turnaround comedic formats for everyday internet absurdity.",
    curationNote: "High satire index, verified punchlines, optimized for single-beat timing.",
    count: 0,
  },
  {
    id: "02",
    number: "02",
    slug: "reaction",
    name: "Reaction",
    description: "Expressive emotional postures, silent stares, and exaggerated disbelief.",
    curationNote: "Universal emotional resonance; cropped for instant thumbnail readability.",
    count: 0,
  },
  {
    id: "03",
    number: "03",
    slug: "animals",
    name: "Animals",
    description: "Canines, felines, capybaras, and unexpected wildlife dilemmas.",
    curationNote: "Certified high engagement; archival animal classics preserved.",
    count: 0,
  },
  {
    id: "04",
    number: "04",
    slug: "gaming",
    name: "Gaming",
    description: "RNG heartbreak, patch note rage, NPC dialogues, and speedrun fails.",
    curationNote: "Context-dense; contains dual-label and dialogue box variants.",
    count: 0,
  },
  {
    id: "05",
    number: "05",
    slug: "relatable",
    name: "Relatable",
    description: "Workplace dread, bedtime procrastination, and domestic quiet catastrophes.",
    curationNote: "Subtle observation-driven structures. High remix velocity.",
    count: 0,
  },
  {
    id: "06",
    number: "06",
    slug: "classic",
    name: "Classic",
    description: "Historical Internet heritage dating from 2010 onwards. Canonized layouts.",
    curationNote: "Strictly preserved ratios and iconic impact font placements.",
    count: 0,
  },
  {
    id: "07",
    number: "07",
    slug: "trending",
    name: "Trending",
    description: "Breakout formats currently overtaking group chats, X, and feeds.",
    curationNote: "Updated on 4-hour cycle. Moderated for fresh contextual spikes.",
    count: 0,
  },
  {
    id: "08",
    number: "08",
    slug: "political-satire",
    name: "Political & Satire",
    description: "Institutional critique, geopolitical irony, and modern social commentary.",
    curationNote: "Neutral archival curation; watermark-free public domain commentary.",
    count: 0,
  },
];

// Helper to create encoded SVGs
export function createSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

// Live community archive catalog: dummy templates completely removed
export const TEMPLATES: Template[] = [];
