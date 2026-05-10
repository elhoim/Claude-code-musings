import { eq, asc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { placementQuestions } from '../db/schema.js';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const QUESTIONS_PER_LEVEL = 5;

/**
 * Returns a set of placement-test questions for the given language,
 * sampling across all CEFR levels.
 */
export async function getPlacementTest(language: string) {
  const questions = await db.query.placementQuestions.findMany({
    where: eq(placementQuestions.language, language),
    orderBy: [asc(placementQuestions.cefrLevel)],
  });

  // Group by CEFR level and take up to QUESTIONS_PER_LEVEL from each
  const grouped = new Map<string, typeof questions>();
  for (const q of questions) {
    const group = grouped.get(q.cefrLevel) ?? [];
    group.push(q);
    grouped.set(q.cefrLevel, group);
  }

  const selected: typeof questions = [];
  for (const level of CEFR_LEVELS) {
    const pool = grouped.get(level) ?? [];
    const shuffled = pool.sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, QUESTIONS_PER_LEVEL));
  }

  // Strip correct answers from the response
  return selected.map(({ correctAnswer: _, ...rest }) => rest);
}

export interface PlacementAnswer {
  questionId: string;
  answer: string;
}

/**
 * Evaluates placement test answers and returns an estimated CEFR level.
 *
 * Strategy: find the highest level where the user got >= 60% correct.
 */
export async function evaluatePlacement(
  language: string,
  answers: PlacementAnswer[],
): Promise<{ cefrLevel: string; correctCount: number; totalCount: number }> {
  const questionIds = answers.map((a) => a.questionId);

  const questions = await db.query.placementQuestions.findMany({
    where: eq(placementQuestions.language, language),
  });

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  // Score per level
  const scoreByLevel = new Map<string, { correct: number; total: number }>();

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    const entry = scoreByLevel.get(question.cefrLevel) ?? { correct: 0, total: 0 };
    entry.total += 1;

    if (answer.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
      entry.correct += 1;
    }

    scoreByLevel.set(question.cefrLevel, entry);
  }

  // Find the highest level with >= 60% correct
  let estimatedLevel = 'A1';
  let totalCorrect = 0;
  let totalCount = 0;

  for (const level of CEFR_LEVELS) {
    const entry = scoreByLevel.get(level);
    if (!entry || entry.total === 0) continue;

    totalCorrect += entry.correct;
    totalCount += entry.total;

    const ratio = entry.correct / entry.total;
    if (ratio >= 0.6) {
      estimatedLevel = level;
    }
  }

  return {
    cefrLevel: estimatedLevel,
    correctCount: totalCorrect,
    totalCount,
  };
}
