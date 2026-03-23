import type {
  FsrsCard,
  FsrsParameters,
  CardState,
  SchedulingResult,
  ReviewLog,
} from './types';
import { Rating } from './types';

/**
 * FSRS-5 default weights.
 */
const DEFAULT_WEIGHTS: number[] = [
  0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
  0.34, 1.26, 0.29, 2.61, 0.0, 0.0,
];

/**
 * Default FSRS parameters.
 */
export const DEFAULT_PARAMETERS: FsrsParameters = {
  requestRetention: 0.9,
  maximumInterval: 36500,
  w: DEFAULT_WEIGHTS,
};

/**
 * Creates a new card in the 'new' state, due immediately.
 */
export function createNewCard(now?: Date): FsrsCard {
  const date = now ?? new Date();
  return {
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: 'new',
    dueDate: date,
  };
}

// ---------------------------------------------------------------------------
// Internal FSRS-5 formulas
// ---------------------------------------------------------------------------

/**
 * Initial difficulty: D0(G) = w[4] - exp(w[5] * (G - 1)) + 1
 * Clamped to [1, 10].
 */
function initDifficulty(rating: Rating, w: number[]): number {
  const d = w[4] - Math.exp(w[5] * (rating - 1)) + 1;
  return clamp(d, 1, 10);
}

/**
 * Initial stability: S0(G) = w[G-1] for G in {1,2,3,4}.
 */
function initStability(rating: Rating, w: number[]): number {
  return w[rating - 1];
}

/**
 * Next difficulty after a review with mean reversion:
 * D'(D, G) = w[6] * D0(G) + (1 - w[6]) * D
 * Clamped to [1, 10].
 */
function nextDifficulty(d: number, rating: Rating, w: number[]): number {
  const d0 = initDifficulty(rating, w);
  const next = w[6] * d0 + (1 - w[6]) * d;
  return clamp(next, 1, 10);
}

/**
 * Retrievability (power forgetting curve):
 * R = exp(ln(0.9) * elapsedDays / stability)
 */
function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.exp((Math.log(0.9) * elapsedDays) / stability);
}

/**
 * Next stability after a successful recall:
 * S' = S * (1 + exp(w[8]) * (11 - D) * S^(-w[9]) * (exp(w[10] * (1 - R)) - 1))
 */
function nextRecallStability(
  s: number,
  d: number,
  r: number,
  w: number[],
): number {
  return (
    s *
    (1 +
      Math.exp(w[8]) *
        (11 - d) *
        Math.pow(s, -w[9]) *
        (Math.exp(w[10] * (1 - r)) - 1))
  );
}

/**
 * Next stability after forgetting (lapse):
 * S' = w[11] * D^(-w[12]) * ((S+1)^w[13] - 1) * exp(w[14] * (1 - R))
 */
function nextForgetStability(
  s: number,
  d: number,
  r: number,
  w: number[],
): number {
  return (
    w[11] *
    Math.pow(d, -w[12]) *
    (Math.pow(s + 1, w[13]) - 1) *
    Math.exp(w[14] * (1 - r))
  );
}

/**
 * Calculate the next interval from stability and desired retention.
 * interval = round(stability * 9 * (1 / requestRetention - 1))
 * Clamped to [1, maximumInterval].
 */
function nextInterval(
  stability: number,
  params: FsrsParameters,
): number {
  const interval = Math.round(
    stability * 9 * (1 / params.requestRetention - 1),
  );
  return clamp(interval, 1, params.maximumInterval);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// Public scheduling function
// ---------------------------------------------------------------------------

/**
 * Schedule a card after a review with the given rating.
 *
 * @param card - The current card state
 * @param rating - The user's rating (Again, Hard, Good, Easy)
 * @param now - Current time (defaults to new Date())
 * @param params - FSRS parameters (defaults to DEFAULT_PARAMETERS)
 * @returns SchedulingResult with the updated card and review log
 */
export function schedule(
  card: FsrsCard,
  rating: Rating,
  now?: Date,
  params?: FsrsParameters,
): SchedulingResult {
  const p = params ?? DEFAULT_PARAMETERS;
  const reviewDate = now ?? new Date();
  const w = p.w;

  // Calculate elapsed days since last review
  const elapsedDays = card.lastReview
    ? Math.max(
        0,
        (reviewDate.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  // Save pre-review state for the log
  const previousState = card.state;

  // Clone the card for mutation
  const next: FsrsCard = {
    ...card,
    elapsedDays,
    lastReview: reviewDate,
    reps: card.reps + 1,
  };

  switch (card.state) {
    case 'new':
      next.stability = initStability(rating, w);
      next.difficulty = initDifficulty(rating, w);
      next.state = 'learning';
      break;

    case 'learning':
    case 'relearning': {
      const r = retrievability(elapsedDays, card.stability);
      next.difficulty = nextDifficulty(card.difficulty, rating, w);

      if (rating === Rating.Again) {
        next.stability = nextForgetStability(card.stability, next.difficulty, r, w);
        // Stay in same state
      } else {
        next.stability = nextRecallStability(card.stability, next.difficulty, r, w);
        next.state = 'review';
      }
      break;
    }

    case 'review': {
      const r = retrievability(elapsedDays, card.stability);
      next.difficulty = nextDifficulty(card.difficulty, rating, w);

      if (rating === Rating.Again) {
        next.stability = nextForgetStability(card.stability, next.difficulty, r, w);
        next.state = 'relearning';
        next.lapses = card.lapses + 1;
      } else {
        next.stability = nextRecallStability(card.stability, next.difficulty, r, w);
        // Stay in 'review'
      }
      break;
    }
  }

  // Calculate the next interval and due date
  const scheduledDays = nextInterval(next.stability, p);
  next.scheduledDays = scheduledDays;
  next.dueDate = new Date(reviewDate.getTime() + scheduledDays * 24 * 60 * 60 * 1000);

  const reviewLog: ReviewLog = {
    scheduledDays,
    elapsedDays,
    rating,
    state: previousState,
    reviewDate,
  };

  return { card: next, reviewLog };
}
