import { z } from 'zod';
import { LANGUAGE_CODES } from '../constants/languages';
import { CEFR_LEVELS } from '../constants/cefr-levels';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
  nativeLanguage: z.enum(LANGUAGE_CODES as [string, ...string[]]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const addLanguageSchema = z.object({
  targetLanguage: z.enum(LANGUAGE_CODES as [string, ...string[]]),
  dailyGoalMinutes: z.number().int().min(5).max(120),
  motivation: z.string().max(500).optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updatePreferencesSchema = z.object({
  notificationEnabled: z.boolean().optional(),
  notificationTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  themeMode: z.enum(['light', 'dark', 'system']).optional(),
  audioSpeed: z.number().min(0.5).max(2.0).optional(),
  autoPlayAudio: z.boolean().optional(),
  showTransliterations: z.boolean().optional(),
});
