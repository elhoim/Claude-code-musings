import { z } from 'zod';
import { LANGUAGE_CODES } from '../constants/languages';

export const submitPlacementSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    }),
  ),
});

export const completeLessonSchema = z.object({
  score: z.number().min(0).max(100),
  exerciseResults: z.array(
    z.object({
      exerciseId: z.string(),
      correct: z.boolean(),
      userAnswer: z.string(),
      timeMs: z.number().int().min(0),
    }),
  ),
});

export const languageParamSchema = z.object({
  lang: z.enum(LANGUAGE_CODES as [string, ...string[]]),
});
