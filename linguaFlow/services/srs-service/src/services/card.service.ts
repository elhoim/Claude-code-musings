import { eq, and, lte, asc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { cards } from '../db/schema.js';

export interface CreateCardInput {
  deckId: string;
  userId: string;
  languageProfileId: string;
  frontType: string;
  frontPrimary: string;
  frontSecondary?: string;
  frontAudioUrl?: string;
  frontImageUrl?: string;
  frontContext?: string;
  backType: string;
  backPrimary: string;
  backSecondary?: string;
  backAudioUrl?: string;
  backImageUrl?: string;
  backContext?: string;
  tags?: string[];
  sourceType?: string;
  sourceId?: string;
}

/**
 * Creates a new flashcard in the given deck.
 */
export async function createCard(input: CreateCardInput) {
  const [card] = await db
    .insert(cards)
    .values({
      deckId: input.deckId,
      userId: input.userId,
      languageProfileId: input.languageProfileId,
      frontType: input.frontType,
      frontPrimary: input.frontPrimary,
      frontSecondary: input.frontSecondary ?? null,
      frontAudioUrl: input.frontAudioUrl ?? null,
      frontImageUrl: input.frontImageUrl ?? null,
      frontContext: input.frontContext ?? null,
      backType: input.backType,
      backPrimary: input.backPrimary,
      backSecondary: input.backSecondary ?? null,
      backAudioUrl: input.backAudioUrl ?? null,
      backImageUrl: input.backImageUrl ?? null,
      backContext: input.backContext ?? null,
      tags: input.tags ?? [],
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
    })
    .returning();

  return card;
}

/**
 * Returns cards that are due for review in a specific deck.
 */
export async function getDueCards(deckId: string, limit: number = 20) {
  const now = new Date();

  return db.query.cards.findMany({
    where: and(eq(cards.deckId, deckId), lte(cards.dueDate, now)),
    orderBy: [asc(cards.dueDate)],
    limit,
  });
}

/**
 * Returns a card by ID.
 */
export async function getCardById(cardId: string) {
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
  });

  return card ?? null;
}
