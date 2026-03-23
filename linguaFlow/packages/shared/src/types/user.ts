import type { CefrLevel, LanguageCode, SkillDimension } from '../constants';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  nativeLanguage: LanguageCode;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLanguageProfile {
  id: string;
  userId: string;
  targetLanguage: LanguageCode;
  overallCefrLevel: CefrLevel;
  skillLevels: Record<SkillDimension, CefrLevel>;
  dailyGoalMinutes: number;
  streakDays: number;
  longestStreak: number;
  totalXp: number;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  notificationEnabled: boolean;
  notificationTime?: string;
  themeMode: 'light' | 'dark' | 'system';
  audioSpeed: number;
  autoPlayAudio: boolean;
  showTransliterations: boolean;
}

export type SubscriptionTier = 'explorer' | 'navigator' | 'pathfinder';

export interface CreateUserInput {
  email: string;
  password: string;
  displayName: string;
  nativeLanguage: LanguageCode;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AddLanguageInput {
  targetLanguage: LanguageCode;
  dailyGoalMinutes: number;
  motivation?: string;
}
