import { eq, and, count, sql } from 'drizzle-orm';
import { schedule, Rating, type FsrsCard, type CardState } from '@linguaflow/srs-engine';
import { db } from '../db/client.js';
import { cards, reviewLogs } from '../db/schema.js';

/**
 * Submits a review for a card. Uses the FSRS algorithm from @linguaflow/srs-engine
 * to compute the next scheduling parameters, updates the card, and creates a review log.
 */
export async function submitReview(
  cardId: string,
  userId: string,
  rating: number,
  durationMs?: number,
) {
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
  });

  if (!card) {
    return null;
  }

  // Build the FsrsCard from the DB record
  const fsrsCard: FsrsCard = {
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsedDays,
    scheduledDays: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as CardState,
    dueDate: card.dueDate,
    lastReview: card.lastReview ?? undefined,
  };

  const now = new Date();
  const result = schedule(fsrsCard, rating as Rating, now);

  // Update the card with new FSRS values
  const [updatedCard] = await db
    .update(cards)
    .set({
      stability: result.card.stability,
      difficulty: result.card.difficulty,
      elapsedDays: Math.round(result.card.elapsedDays),
      scheduledDays: result.card.scheduledDays,
      reps: result.card.reps,
      lapses: result.card.lapses,
      state: result.card.state,
      dueDate: result.card.dueDate,
      lastReview: result.card.lastReview ?? null,
      updatedAt: now,
    })
    .where(eq(cards.id, cardId))
    .returning();

  // Create a review log entry
  const [log] = await db
    .insert(reviewLogs)
    .values({
      cardId,
      userId,
      rating,
      reviewDurationMs: durationMs ?? null,
      scheduledDays: result.reviewLog.scheduledDays,
      elapsedDays: Math.round(result.reviewLog.elapsedDays),
      reviewedAt: now,
    })
    .returning();

  return { card: updatedCard, reviewLog: log };
}

/**
 * Returns review statistics for a user.
 */
export async function getStats(userId: string) {
  const totalCardsResult = await db
    .select({ count: count() })
    .from(cards)
    .where(eq(cards.userId, userId));

  const totalReviewsResult = await db
    .select({ count: count() })
    .from(reviewLogs)
    .where(eq(reviewLogs.userId, userId));

  // Cards due now
  const now = new Date();
  const dueCardsResult = await db
    .select({ count: count() })
    .from(cards)
    .where(
      and(
        eq(cards.userId, userId),
        sql`${cards.dueDate} <= ${now}`,
      ),
    );

  // Reviews today
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const reviewsTodayResult = await db
    .select({ count: count() })
    .from(reviewLogs)
    .where(
      and(
        eq(reviewLogs.userId, userId),
        sql`${reviewLogs.reviewedAt} >= ${startOfDay}`,
      ),
    );

  return {
    totalCards: totalCardsResult[0]?.count ?? 0,
    totalReviews: totalReviewsResult[0]?.count ?? 0,
    dueCards: dueCardsResult[0]?.count ?? 0,
    reviewsToday: reviewsTodayResult[0]?.count ?? 0,
  };
}
