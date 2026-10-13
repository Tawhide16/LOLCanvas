import { z } from "zod";

export const templateQuerySchema = z.object({
  category: z.string().optional().default("all"),
  search: z.string().optional().default(""),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const createTemplateSchema = z.object({
  slug: z.string().min(2).max(100).toLowerCase().trim(),
  title: z.string().min(2).max(120).trim(),
  category: z.string().min(2).max(50),
  tags: z.array(z.string()).default([]),
  svgDataUri: z.string().min(10, "SVG or image data is required"),
  width: z.number().int().min(100).max(8000).default(1080),
  height: z.number().int().min(100).max(8000).default(1080),
  defaultTopText: z.string().optional(),
  defaultBottomText: z.string().optional(),
});

export type TemplateQueryInput = z.infer<typeof templateQuerySchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
