import type { LanguageCode } from '../constants';

export interface Deck {
  id: string;
  userId: string;
  languageProfileId: string;
  name: string;
  description?: string;
  cardCount: number;
  dueCount: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SrsCard {
  id: string;
  deckId: string;
  userId: string;
  languageProfileId: string;
  front: CardContent;
  back: CardContent;
  fsrsState: FsrsState;
  tags: string[];
  sourceType: CardSourceType;
  sourceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CardSourceType = 'lesson' | 'story' | 'grammar' | 'user_created' | 'clipboard' | 'media_import';

export interface CardContent {
  type: 'text' | 'audio' | 'image' | 'cloze' | 'sentence';
  primary: string;
  secondary?: string;
  audioUrl?: string;
  imageUrl?: string;
  context?: string;
}

export interface FsrsState {
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: CardState;
  dueDate: Date;
  lastReview?: Date;
}

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export type ReviewRating = 1 | 2 | 3 | 4;

export const REVIEW_RATING_LABELS: Record<ReviewRating, string> = {
  1: 'Again',
  2: 'Hard',
  3: 'Good',
  4: 'Easy',
};

export interface ReviewLog {
  id: string;
  cardId: string;
  userId: string;
  rating: ReviewRating;
  reviewDurationMs: number;
  scheduledDays: number;
  elapsedDays: number;
  reviewedAt: Date;
}

export interface CreateCardInput {
  deckId: string;
  front: CardContent;
  back: CardContent;
  tags?: string[];
  sourceType: CardSourceType;
  sourceId?: string;
}

export interface ReviewSessionStats {
  totalReviewed: number;
  correct: number;
  incorrect: number;
  averageTimeMs: number;
  newCardsStudied: number;
  reviewsCompleted: number;
}

export interface DeckStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  dueToday: number;
  averageRetention: number;
}
