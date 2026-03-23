import { eq, and } from 'drizzle-orm';
import { db } from '../db/client';
import { grammarNodes, grammarEdges, userGrammarProgress } from '../db/schema';
import type { LanguageCode } from '@linguaflow/shared';

export async function getGrammarGraph(language: LanguageCode) {
  const nodes = await db
    .select()
    .from(grammarNodes)
    .where(eq(grammarNodes.language, language))
    .orderBy(grammarNodes.order);

  const nodeIds = nodes.map((n) => n.id);
  const edges = nodeIds.length > 0
    ? await db.select().from(grammarEdges)
    : [];

  return { language, nodes, edges };
}

export async function getGrammarNode(language: LanguageCode, nodeId: string) {
  const [node] = await db
    .select()
    .from(grammarNodes)
    .where(and(eq(grammarNodes.id, nodeId), eq(grammarNodes.language, language)));

  return node || null;
}

export async function getUserProgress(userId: string, language: LanguageCode) {
  const nodes = await db
    .select({ id: grammarNodes.id })
    .from(grammarNodes)
    .where(eq(grammarNodes.language, language));

  const nodeIds = nodes.map((n) => n.id);
  if (nodeIds.length === 0) return [];

  const progress = await db
    .select()
    .from(userGrammarProgress)
    .where(eq(userGrammarProgress.userId, userId));

  return progress.filter((p) => nodeIds.includes(p.grammarNodeId));
}

export async function updateUserProgress(
  userId: string,
  grammarNodeId: string,
  correct: boolean,
) {
  const existing = await db
    .select()
    .from(userGrammarProgress)
    .where(
      and(
        eq(userGrammarProgress.userId, userId),
        eq(userGrammarProgress.grammarNodeId, grammarNodeId),
      ),
    );

  if (existing.length > 0) {
    const current = existing[0];
    const newPracticeCount = current.practiceCount + 1;
    const newCorrectCount = current.correctCount + (correct ? 1 : 0);
    const newMastery = (newCorrectCount / newPracticeCount) * 100;
    const newStatus = newMastery >= 80 && newPracticeCount >= 5 ? 'mastered' : 'in_progress';

    const [updated] = await db
      .update(userGrammarProgress)
      .set({
        practiceCount: newPracticeCount,
        correctCount: newCorrectCount,
        masteryScore: newMastery,
        status: newStatus,
        lastPracticedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userGrammarProgress.id, current.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(userGrammarProgress)
    .values({
      userId,
      grammarNodeId,
      status: 'in_progress',
      masteryScore: correct ? 100 : 0,
      practiceCount: 1,
      correctCount: correct ? 1 : 0,
      lastPracticedAt: new Date(),
    })
    .returning();

  return created;
}
