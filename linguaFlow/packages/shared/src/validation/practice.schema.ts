import { z } from 'zod';
import { LANGUAGE_CODES } from '../constants/languages';

export const startDrillSchema = z.object({
  mode: z.enum(['reformulation', 'situation_response', 'narrative_sprint']),
  language: z.enum(LANGUAGE_CODES as [string, ...string[]]),
  timeLimitSeconds: z.number().int().min(5).max(300).optional(),
});

export const submitDrillSchema = z.object({
  audioUrl: z.string().url(),
  transcription: z.string().min(1),
  durationSeconds: z.number().min(0),
});
