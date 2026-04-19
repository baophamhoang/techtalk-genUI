import { z } from "zod";

export const restructureHomeSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
    tag: z.string().optional(),
  }).optional(),
  rows: z.array(z.object({
    title: z.string(),
    items: z.array(z.object({
      name: z.string(),
      price: z.string(),
      image: z.string().optional(),
      badge: z.string().optional(),
    })),
  })),
  hideDefaultRows: z.boolean().optional(),
});

export const showMoodPickerSchema = z.object({
  prompt: z.string(),
  moods: z.array(z.object({
    label: z.string(),
    icon: z.string(),
    curatedItems: z.array(z.object({
      name: z.string(),
      price: z.string(),
      image: z.string().optional(),
    })),
  })),
});

export const showContextBannerSchema = z.object({
  tone: z.enum(["info", "warning", "success"]),
  title: z.string(),
  message: z.string(),
});

export const showCuratedRowSchema = z.object({
  title: z.string(),
  tag: z.string().optional(),
  items: z.array(z.object({
    name: z.string(),
    price: z.string(),
    image: z.string().optional(),
    macroBadges: z.array(z.string()).optional(),
    priceRange: z.string().optional(),
  })),
  macroBadges: z.array(z.string()).optional(),
  priceRange: z.string().optional(),
});

export const primitives = {
  restructureHome: restructureHomeSchema,
  showMoodPicker: showMoodPickerSchema,
  showContextBanner: showContextBannerSchema,
  showCuratedRow: showCuratedRowSchema,
} as const;

export type PrimitiveName = keyof typeof primitives;