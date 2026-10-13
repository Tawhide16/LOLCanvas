export interface CanvasPreset {
  id: string;
  name: string;
  category: "social" | "video" | "meme" | "custom";
  width: number;
  height: number;
  aspectLabel: string;
  description?: string;
  iconName?: string;
}

export const SOCIAL_PRESETS: CanvasPreset[] = [
  {
    id: "ig-post",
    name: "Instagram Post",
    category: "social",
    width: 1080,
    height: 1080,
    aspectLabel: "1:1 Square",
    description: "Standard square feed post",
  },
  {
    id: "ig-story",
    name: "Instagram Story",
    category: "social",
    width: 1080,
    height: 1920,
    aspectLabel: "9:16 Vertical",
    description: "Full-screen vertical story & reel",
  },
  {
    id: "fb-post",
    name: "Facebook Post",
    category: "social",
    width: 1200,
    height: 630,
    aspectLabel: "1.91:1 Landscape",
    description: "Feed image optimized for mobile & desktop",
  },
  {
    id: "fb-cover",
    name: "Facebook Cover",
    category: "social",
    width: 820,
    height: 312,
    aspectLabel: "2.63:1 Banner",
    description: "Page & profile header banner",
  },
  {
    id: "yt-thumb",
    name: "YouTube Thumbnail",
    category: "social",
    width: 1280,
    height: 720,
    aspectLabel: "16:9 Landscape",
    description: "High-clickthrough video preview image",
  },
  {
    id: "tiktok-cover",
    name: "TikTok Video Cover",
    category: "social",
    width: 1080,
    height: 1920,
    aspectLabel: "9:16 Vertical",
    description: "Dynamic video preview frame",
  },
  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    category: "social",
    width: 1200,
    height: 627,
    aspectLabel: "1.91:1 Feed",
    description: "Professional timeline graphic",
  },
];

export const VIDEO_PRESETS: CanvasPreset[] = [
  {
    id: "yt-video",
    name: "YouTube Video",
    category: "video",
    width: 1920,
    height: 1080,
    aspectLabel: "16:9 Full HD",
    description: "Standard horizontal video format",
  },
  {
    id: "tiktok-reels",
    name: "TikTok / Reels",
    category: "video",
    width: 1080,
    height: 1920,
    aspectLabel: "9:16 Portrait",
    description: "Short-form vertical video standard",
  },
  {
    id: "ig-square-video",
    name: "Instagram Square Video",
    category: "video",
    width: 1080,
    height: 1080,
    aspectLabel: "1:1 Square",
    description: "High-engagement feed video post",
  },
  {
    id: "yt-shorts",
    name: "YouTube Shorts",
    category: "video",
    width: 1080,
    height: 1920,
    aspectLabel: "9:16 Shorts",
    description: "Vertical mobile discovery video",
  },
];
