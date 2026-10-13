import { z } from "zod";

// Zod Schema for interactive canvas layers (Text, Image Overlays, Badges)
export const canvasLayerSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "image", "sticker"]),
  // Text layer properties
  text: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.number().min(8).max(200).optional(),
  color: z.string().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().min(0).max(30).optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  isUppercase: z.boolean().optional(),
  // Image overlay layer properties
  imageUrl: z.string().url().or(z.string().startsWith("data:image/")).optional(),
  imageName: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  scale: z.number().min(0.1).max(10).optional(),
  rotation: z.number().min(-360).max(360).optional(),
  opacity: z.number().min(0).max(1).optional(),
  flipX: z.boolean().optional(),
  flipY: z.boolean().optional(),
  // Cropping & masking properties
  cropX: z.number().min(0).max(100).optional(),
  cropY: z.number().min(0).max(100).optional(),
  cropWidth: z.number().min(5).max(100).optional(),
  cropHeight: z.number().min(5).max(100).optional(),
  // Sticker badge
  stickerSymbol: z.string().optional(),
  // Position & stacking
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  zIndex: z.number().int().default(1),
});

// Zod schema for saving a meme composition
export const createMemeSchema = z.object({
  title: z
    .string()
    .min(1, "Meme title is required")
    .max(120, "Title is too long")
    .trim(),
  templateId: z.string().optional(),
  previewUrl: z
    .string()
    .url()
    .or(z.string().startsWith("data:image/"))
    .optional(),
  layers: z
    .array(canvasLayerSchema)
    .min(1, "At least one layer is required on the canvas"),
  width: z.number().int().min(100).max(8000).default(1080),
  height: z.number().int().min(100).max(8000).default(1080),
  isPublic: z.boolean().default(true),
});

export const getMemesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  authorId: z.string().optional(),
});

export type CreateMemeInput = z.infer<typeof createMemeSchema>;
export type GetMemesQueryInput = z.infer<typeof getMemesQuerySchema>;
