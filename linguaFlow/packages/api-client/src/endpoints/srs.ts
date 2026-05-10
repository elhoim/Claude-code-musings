import type { AxiosInstance } from 'axios';
import type {
  Deck,
  SrsCard,
  ReviewLog,
  DeckStats,
  ReviewSessionStats,
  CreateCardInput,
  ReviewRating,
} from '@linguaflow/shared';

export function createSrsEndpoints(client: AxiosInstance) {
  return {
    getDecks: async (): Promise<Deck[]> => {
      const { data } = await client.get<Deck[]>('/api/v1/srs/decks');
      return data;
    },

    createDeck: async (input: { name: string; description?: string; languageProfileId: string }): Promise<Deck> => {
      const { data } = await client.post<Deck>('/api/v1/srs/decks', input);
      return data;
    },

    getDueCards: async (deckId: string, limit?: number): Promise<SrsCard[]> => {
      const { data } = await client.get<SrsCard[]>(`/api/v1/srs/decks/${deckId}/due`, {
        params: { limit },
      });
      return data;
    },

    createCard: async (input: CreateCardInput): Promise<SrsCard> => {
      const { data } = await client.post<SrsCard>('/api/v1/srs/cards', input);
      return data;
    },

    submitReview: async (
      cardId: string,
      rating: ReviewRating,
      reviewDurationMs: number,
    ): Promise<{ card: SrsCard; log: ReviewLog }> => {
      const { data } = await client.post<{ card: SrsCard; log: ReviewLog }>(
        `/api/v1/srs/cards/${cardId}/review`,
        { rating, reviewDurationMs },
      );
      return data;
    },

    getStats: async (): Promise<ReviewSessionStats> => {
      const { data } = await client.get<ReviewSessionStats>('/api/v1/srs/stats');
      return data;
    },

    getDeckStats: async (deckId: string): Promise<DeckStats> => {
      const { data } = await client.get<DeckStats>(`/api/v1/srs/decks/${deckId}/stats`);
      return data;
    },
  };
}
