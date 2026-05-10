/**
 * Card states in the FSRS algorithm.
 */
export type CardState = 'new' | 'learning' | 'review' | 'relearning';

/**
 * Rating values for card reviews.
 */
export enum Rating {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

/**
 * Represents a card's scheduling state in the FSRS system.
 */
export interface FsrsCard {
  /** Memory stability — expected days until recall probability drops to 90% */
  stability: number;
  /** Item difficulty, range [1, 10] */
  difficulty: number;
  /** Days elapsed since the last review */
  elapsedDays: number;
  /** Days until the next scheduled review */
  scheduledDays: number;
  /** Total number of reviews */
  reps: number;
  /** Number of times the card lapsed (was forgotten) */
  lapses: number;
  /** Current card state */
  state: CardState;
  /** When the card is due for review */
  dueDate: Date;
  /** When the card was last reviewed */
  lastReview?: Date;
}

/**
 * FSRS algorithm parameters.
 */
export interface FsrsParameters {
  /** Target recall probability, default 0.9 */
  requestRetention: number;
  /** Maximum interval in days, default 36500 */
  maximumInterval: number;
  /** FSRS-5 model weights (19 values) */
  w: number[];
}

/**
 * A review log entry recording what happened during a review.
 */
export interface ReviewLog {
  /** Days that were scheduled before this review */
  scheduledDays: number;
  /** Days that actually elapsed since the previous review */
  elapsedDays: number;
  /** The rating given */
  rating: Rating;
  /** The card's state before this review */
  state: CardState;
  /** When this review occurred */
  reviewDate: Date;
}

/**
 * The result of scheduling a card after a review.
 */
export interface SchedulingResult {
  /** The updated card with new scheduling parameters */
  card: FsrsCard;
  /** Log entry for this review */
  reviewLog: ReviewLog;
}
