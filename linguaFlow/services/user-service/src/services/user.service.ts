import { eq, and } from 'drizzle-orm';
import type { AddLanguageInput } from '@linguaflow/shared';
import { ERROR_CODES } from '@linguaflow/shared';
import { db } from '../db/client.js';
import { users, userLanguageProfiles, userPreferences } from '../db/schema.js';
import { AppError } from './auth.service.js';

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      passwordHash: false,
    },
  });

  if (!user) {
    throw new AppError(404, ERROR_CODES.USER_NOT_FOUND, 'User not found');
  }

  return user;
}

export async function updateProfile(
  userId: string,
  data: { displayName?: string; avatarUrl?: string },
) {
  const [updated] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      nativeLanguage: users.nativeLanguage,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  if (!updated) {
    throw new AppError(404, ERROR_CODES.USER_NOT_FOUND, 'User not found');
  }

  return updated;
}

export async function getUserLanguageProfiles(userId: string) {
  return db.query.userLanguageProfiles.findMany({
    where: eq(userLanguageProfiles.userId, userId),
  });
}

export async function addLanguageProfile(userId: string, input: AddLanguageInput) {
  const existing = await db.query.userLanguageProfiles.findFirst({
    where: and(
      eq(userLanguageProfiles.userId, userId),
      eq(userLanguageProfiles.targetLanguage, input.targetLanguage),
    ),
  });

  if (existing) {
    throw new AppError(
      409,
      ERROR_CODES.LANGUAGE_PROFILE_ALREADY_EXISTS,
      'Language profile already exists',
    );
  }

  const [profile] = await db
    .insert(userLanguageProfiles)
    .values({
      userId,
      targetLanguage: input.targetLanguage,
      dailyGoalMinutes: input.dailyGoalMinutes,
    })
    .returning();

  return profile;
}

export async function updateLanguageProfile(
  userId: string,
  targetLanguage: string,
  data: Partial<{
    overallCefrLevel: string;
    readingLevel: string;
    writingLevel: string;
    listeningLevel: string;
    speakingLevel: string;
    dailyGoalMinutes: number;
    streakDays: number;
    longestStreak: number;
    totalXp: number;
    lastActiveAt: Date;
  }>,
) {
  const [updated] = await db
    .update(userLanguageProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userLanguageProfiles.userId, userId),
        eq(userLanguageProfiles.targetLanguage, targetLanguage),
      ),
    )
    .returning();

  if (!updated) {
    throw new AppError(
      404,
      ERROR_CODES.LANGUAGE_PROFILE_NOT_FOUND,
      'Language profile not found',
    );
  }

  return updated;
}

export async function getPreferences(userId: string) {
  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  if (!prefs) {
    throw new AppError(404, ERROR_CODES.USER_NOT_FOUND, 'User preferences not found');
  }

  return prefs;
}

export async function updatePreferences(
  userId: string,
  data: Partial<{
    notificationEnabled: boolean;
    notificationTime: string;
    themeMode: string;
    audioSpeed: number;
    autoPlayAudio: boolean;
    showTransliterations: boolean;
  }>,
) {
  const [updated] = await db
    .update(userPreferences)
    .set(data)
    .where(eq(userPreferences.userId, userId))
    .returning();

  if (!updated) {
    throw new AppError(404, ERROR_CODES.USER_NOT_FOUND, 'User preferences not found');
  }

  return updated;
}
