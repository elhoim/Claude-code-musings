import { eq, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { decks } from '../db/schema.js';

export interface CreateDeckInput {
  userId: string;
  languageProfileId: string;
  name: string;
  description?: string;
  isDefault?: boolean;
}

/**
 * Returns all decks for a user.
 */
export async function getDecks(userId: string) {
  return db.query.decks.findMany({
    where: eq(decks.userId, userId),
    orderBy: (decks, { desc }) => [desc(decks.createdAt)],
  });
}

/**
 * Creates a new deck.
 */
export async function createDeck(input: CreateDeckInput) {
  const [deck] = await db
    .insert(decks)
    .values({
      userId: input.userId,
      languageProfileId: input.languageProfileId,
      name: input.name,
      description: input.description ?? null,
      isDefault: input.isDefault ?? false,
    })
    .returning();

  return deck;
}

/**
 * Returns a single deck by ID, ensuring it belongs to the user.
 */
export async function getDeck(userId: string, deckId: string) {
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
    with: { cards: true },
  });

  return deck ?? null;
}

/**
 * Deletes a deck if it belongs to the user. Returns true if deleted.
 */
export async function deleteDeck(userId: string, deckId: string): Promise<boolean> {
  const result = await db
    .delete(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .returning({ id: decks.id });

  return result.length > 0;
}
