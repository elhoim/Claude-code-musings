import { z } from 'zod';

const cardContentSchema = z.object({
  type: z.enum(['text', 'audio', 'image', 'cloze', 'sentence']),
  primary: z.string().min(1),
  secondary: z.string().optional(),
  audioUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  context: z.string().optional(),
});

export const createDeckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  languageProfileId: z.string().uuid(),
});

export const createCardSchema = z.object({
  deckId: z.string().uuid(),
  front: cardContentSchema,
  back: cardContentSchema,
  tags: z.array(z.string()).optional(),
  sourceType: z.enum(['lesson', 'story', 'grammar', 'user_created', 'clipboard', 'media_import']),
  sourceId: z.string().optional(),
});

export const submitReviewSchema = z.object({
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  reviewDurationMs: z.number().int().min(0),
});
