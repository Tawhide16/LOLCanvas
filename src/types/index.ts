export interface Category {
  id: string;
  number: string; // "01" - "08"
  slug: string;
  name: string;
  description: string;
  curationNote: string;
  count: number;
}

export type FormatType = "classic" | "tweet" | "multi-panel" | "vertical";

export interface Template {
  id: string;
  slug: string;
  index: string; // e.g. "№ 0012"
  title: string;
  categoryId: string;
  categoryName: string;
  format: FormatType;
  formatLabel: string;
  remixCount: number;
  downloadCount: number;
  createdAt: string;
  source: string;
  license: string;
  aspectRatio: string; // e.g. "1:1", "4:3", "16:9"
  width: number;
  height: number;
  defaultTopText?: string;
  defaultBottomText?: string;
  svgDataUri: string; // Vector/data representation for rendering on HTML5 canvas and preview
  tags: string[];
  trendingRank?: number;
  isWatermarkFree?: boolean;
  authorEmail?: string | null;
}

export interface CanvasLayer {
  id: string;
  type: "text" | "sticker" | "watermark_remover" | "image";
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  align?: "left" | "center" | "right";
  isUppercase?: boolean;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  scale?: number;
  flipX?: boolean;
  flipY?: boolean;
  imageUrl?: string;
  imageName?: string;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  stickerSymbol?: string;
  zIndex: number;
}

export interface SubmissionItem {
  id: string;
  title: string;
  categoryId: string;
  format: FormatType;
  imageUrl: string;
  authorName: string;
  authorEmail: string;
  licenseType: string;
  moderationStatus: "approved" | "pending" | "review";
  submittedAt: string;
  notes?: string;
}
