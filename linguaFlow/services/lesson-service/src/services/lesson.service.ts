import { eq, and, asc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { units, lessons, exercises, userLessonProgress } from '../db/schema.js';

export interface LessonResult {
  score: number;
  completed: boolean;
}

/**
 * Returns the learning path (units + lessons) for a user in a given language,
 * annotated with the user's progress on each lesson.
 */
export async function getLearningPath(userId: string, language: string) {
  const allUnits = await db.query.units.findMany({
    where: eq(units.language, language),
    orderBy: [asc(units.order)],
    with: {
      lessons: {
        orderBy: [asc(lessons.order)],
      },
    },
  });

  // Fetch progress for all lessons belonging to these units
  const lessonIds = allUnits.flatMap((u) => u.lessons.map((l) => l.id));

  if (lessonIds.length === 0) {
    return allUnits.map((u) => ({ ...u, lessons: [] }));
  }

  const progressRows = await db.query.userLessonProgress.findMany({
    where: and(
      eq(userLessonProgress.userId, userId),
    ),
  });

  const progressMap = new Map(progressRows.map((p) => [p.lessonId, p]));

  return allUnits.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => ({
      ...lesson,
      progress: progressMap.get(lesson.id) ?? null,
    })),
  }));
}

/**
 * Returns a single lesson with its exercises.
 */
export async function getLesson(id: string) {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, id),
    with: {
      exercises: {
        orderBy: [asc(exercises.order)],
      },
      unit: true,
    },
  });

  return lesson ?? null;
}

/**
 * Records lesson completion and updates the user's progress.
 */
export async function completeLesson(
  userId: string,
  lessonId: string,
  result: LessonResult,
) {
  const existing = await db.query.userLessonProgress.findFirst({
    where: and(
      eq(userLessonProgress.userId, userId),
      eq(userLessonProgress.lessonId, lessonId),
    ),
  });

  const now = new Date();

  if (existing) {
    const bestScore = Math.max(existing.bestScore ?? 0, result.score);

    const [updated] = await db
      .update(userLessonProgress)
      .set({
        score: result.score,
        bestScore,
        completed: existing.completed || result.completed,
        attempts: existing.attempts + 1,
        completedAt: result.completed ? now : existing.completedAt,
        updatedAt: now,
      })
      .where(eq(userLessonProgress.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(userLessonProgress)
    .values({
      userId,
      lessonId,
      score: result.score,
      bestScore: result.score,
      completed: result.completed,
      attempts: 1,
      completedAt: result.completed ? now : null,
      updatedAt: now,
    })
    .returning();

  return created;
}

/**
 * Returns the user's progress across all lessons for a language.
 */
export async function getProgress(userId: string, language: string) {
  const languageLessons = await db.query.lessons.findMany({
    where: eq(lessons.language, language),
    columns: { id: true },
  });

  const lessonIds = languageLessons.map((l) => l.id);

  if (lessonIds.length === 0) {
    return { totalLessons: 0, completedLessons: 0, progress: [] };
  }

  const progressRows = await db.query.userLessonProgress.findMany({
    where: eq(userLessonProgress.userId, userId),
    with: {
      lesson: { columns: { id: true, language: true, title: true } },
    },
  });

  const filtered = progressRows.filter((p) => lessonIds.includes(p.lessonId));
  const completedCount = filtered.filter((p) => p.completed).length;

  return {
    totalLessons: lessonIds.length,
    completedLessons: completedCount,
    progress: filtered,
  };
}
