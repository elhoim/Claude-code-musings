import { create } from 'zustand';

interface Deck {
  id: string;
  name: string;
  languageCode: string;
  cardCount: number;
}

interface SrsCard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  example?: string;
  nextReviewAt: string;
  interval: number;
  easeFactor: number;
}

type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

interface SrsState {
  decks: Deck[];
  currentDeck: Deck | null;
  dueCards: SrsCard[];
  currentCardIndex: number;
  currentReviewSession: {
    reviewed: number;
    correct: number;
    startedAt: Date | null;
  };
  isLoading: boolean;

  setDecks: (decks: Deck[]) => void;
  loadDecks: () => Promise<void>;
  startReview: (deckId?: string) => Promise<void>;
  submitRating: (rating: ReviewRating) => void;
  endSession: () => void;
  setLoading: (loading: boolean) => void;
}

export const useSrsStore = create<SrsState>((set, get) => ({
  decks: [],
  currentDeck: null,
  dueCards: [],
  currentCardIndex: 0,
  currentReviewSession: { reviewed: 0, correct: 0, startedAt: null },
  isLoading: false,

  setDecks: (decks) => set({ decks }),

  loadDecks: async () => {
    set({ isLoading: true });
    // Placeholder: would fetch decks from API
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  startReview: async (deckId?: string) => {
    set({ isLoading: true });
    // Placeholder: would fetch due cards from API
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({
      currentCardIndex: 0,
      currentReviewSession: { reviewed: 0, correct: 0, startedAt: new Date() },
      isLoading: false,
    });
  },

  submitRating: (rating) =>
    set((state) => ({
      currentCardIndex: state.currentCardIndex + 1,
      currentReviewSession: {
        ...state.currentReviewSession,
        reviewed: state.currentReviewSession.reviewed + 1,
        correct:
          state.currentReviewSession.correct +
          (rating === 'good' || rating === 'easy' ? 1 : 0),
      },
    })),

  endSession: () =>
    set({
      currentDeck: null,
      dueCards: [],
      currentCardIndex: 0,
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
