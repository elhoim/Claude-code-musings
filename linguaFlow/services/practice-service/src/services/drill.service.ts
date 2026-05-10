import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client';
import { drillSessions } from '../db/schema';
import { generatePrompt } from './prompt-generator.service';
import type { DrillMode } from '@linguaflow/shared';
import { DRILL_MODE_INFO } from '@linguaflow/shared';

export async function startDrill(
  userId: string,
  mode: DrillMode,
  language: string,
  cefrLevel: string,
  timeLimitSeconds?: number,
) {
  const modeInfo = DRILL_MODE_INFO[mode];
  const timeLimit = timeLimitSeconds ?? modeInfo.defaultTimeSeconds;
  const prompt = generatePrompt(mode, language, cefrLevel);

  const [session] = await db
    .insert(drillSessions)
    .values({
      userId,
      mode,
      language,
      cefrLevel,
      timeLimitSeconds: timeLimit,
      promptType: prompt.type,
      promptContent: prompt.content,
      promptInstruction: prompt.instruction,
      promptTargetVocabulary: prompt.targetVocabulary,
      promptTargetGrammar: prompt.targetGrammar,
      startedAt: new Date(),
    })
    .returning();

  return session;
}

export async function submitDrill(
  drillId: string,
  response: {
    audioUrl?: string;
    transcription?: string;
    durationSeconds?: number;
  },
) {
  const [updated] = await db
    .update(drillSessions)
    .set({
      responseAudioUrl: response.audioUrl,
      responseTranscription: response.transcription,
      responseDurationSeconds: response.durationSeconds,
      completedAt: new Date(),
    })
    .where(eq(drillSessions.id, drillId))
    .returning();

  return updated;
}

export async function getDrillById(drillId: string) {
  const [session] = await db
    .select()
    .from(drillSessions)
    .where(eq(drillSessions.id, drillId));

  return session || null;
}

export async function getDrillHistory(userId: string, limit: number = 20) {
  const sessions = await db
    .select()
    .from(drillSessions)
    .where(eq(drillSessions.userId, userId))
    .orderBy(desc(drillSessions.startedAt))
    .limit(limit);

  return sessions;
}

export async function updateDrillFeedback(drillId: string, feedbackJson: unknown) {
  const [updated] = await db
    .update(drillSessions)
    .set({ feedbackJson })
    .where(eq(drillSessions.id, drillId))
    .returning();

  return updated;
}
