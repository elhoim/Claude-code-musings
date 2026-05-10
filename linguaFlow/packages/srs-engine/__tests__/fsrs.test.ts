import { describe, it, expect } from 'vitest';
import {
  createNewCard,
  schedule,
  DEFAULT_PARAMETERS,
  Rating,
  getSchedulingOptions,
  isDue,
} from '../src/index';
import type { FsrsCard } from '../src/index';

describe('createNewCard', () => {
  it('creates a card in new state due now', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const card = createNewCard(now);

    expect(card.state).toBe('new');
    expect(card.stability).toBe(0);
    expect(card.difficulty).toBe(0);
    expect(card.reps).toBe(0);
    expect(card.lapses).toBe(0);
    expect(card.elapsedDays).toBe(0);
    expect(card.scheduledDays).toBe(0);
    expect(card.dueDate).toEqual(now);
    expect(card.lastReview).toBeUndefined();
  });
});

describe('schedule — new card', () => {
  const now = new Date('2025-01-01T00:00:00Z');

  it('transitions to learning on Again', () => {
    const card = createNewCard(now);
    const result = schedule(card, Rating.Again, now);

    expect(result.card.state).toBe('learning');
    expect(result.card.reps).toBe(1);
    // S0(Again) = w[0] = 0.4
    expect(result.card.stability).toBeCloseTo(0.4, 5);
    expect(result.card.difficulty).toBeGreaterThanOrEqual(1);
    expect(result.card.difficulty).toBeLessThanOrEqual(10);
    expect(result.reviewLog.state).toBe('new');
    expect(result.reviewLog.rating).toBe(Rating.Again);
  });

  it('transitions to learning on Hard', () => {
    const card = createNewCard(now);
    const result = schedule(card, Rating.Hard, now);

    expect(result.card.state).toBe('learning');
    // S0(Hard) = w[1] = 0.6
    expect(result.card.stability).toBeCloseTo(0.6, 5);
  });

  it('transitions to learning on Good', () => {
    const card = createNewCard(now);
    const result = schedule(card, Rating.Good, now);

    expect(result.card.state).toBe('learning');
    // S0(Good) = w[2] = 2.4
    expect(result.card.stability).toBeCloseTo(2.4, 5);
  });

  it('transitions to learning on Easy', () => {
    const card = createNewCard(now);
    const result = schedule(card, Rating.Easy, now);

    expect(result.card.state).toBe('learning');
    // S0(Easy) = w[3] = 5.8
    expect(result.card.stability).toBeCloseTo(5.8, 5);
  });

  it('sets due date in the future', () => {
    const card = createNewCard(now);
    const result = schedule(card, Rating.Good, now);

    expect(result.card.dueDate.getTime()).toBeGreaterThan(now.getTime());
    expect(result.card.scheduledDays).toBeGreaterThanOrEqual(1);
  });
});

describe('schedule — learning card', () => {
  const now = new Date('2025-01-01T00:00:00Z');

  function makeLearningCard(): FsrsCard {
    const card = createNewCard(now);
    return schedule(card, Rating.Good, now).card;
  }

  it('Again keeps card in learning', () => {
    const learning = makeLearningCard();
    // Simulate reviewing the next day
    const reviewDate = new Date('2025-01-02T00:00:00Z');
    const result = schedule(learning, Rating.Again, reviewDate);

    expect(result.card.state).toBe('learning');
  });

  it('Good transitions to review', () => {
    const learning = makeLearningCard();
    const reviewDate = new Date('2025-01-02T00:00:00Z');
    const result = schedule(learning, Rating.Good, reviewDate);

    expect(result.card.state).toBe('review');
  });

  it('Easy transitions to review', () => {
    const learning = makeLearningCard();
    const reviewDate = new Date('2025-01-02T00:00:00Z');
    const result = schedule(learning, Rating.Easy, reviewDate);

    expect(result.card.state).toBe('review');
  });
});

describe('schedule — review card', () => {
  const now = new Date('2025-01-01T00:00:00Z');

  function makeReviewCard(): { card: FsrsCard; reviewDate: Date } {
    const card = createNewCard(now);
    // New -> Learning (Good)
    const step1 = schedule(card, Rating.Good, now);
    // Learning -> Review (Good), review next day
    const day2 = new Date('2025-01-02T00:00:00Z');
    const step2 = schedule(step1.card, Rating.Good, day2);
    expect(step2.card.state).toBe('review');
    return { card: step2.card, reviewDate: day2 };
  }

  it('stability increases on Good', () => {
    const { card: reviewCard, reviewDate } = makeReviewCard();
    const nextReview = new Date(
      reviewDate.getTime() + reviewCard.scheduledDays * 24 * 60 * 60 * 1000,
    );
    const result = schedule(reviewCard, Rating.Good, nextReview);

    expect(result.card.stability).toBeGreaterThan(reviewCard.stability);
    expect(result.card.state).toBe('review');
  });

  it('stability increases on Easy', () => {
    const { card: reviewCard, reviewDate } = makeReviewCard();
    const nextReview = new Date(
      reviewDate.getTime() + reviewCard.scheduledDays * 24 * 60 * 60 * 1000,
    );
    const result = schedule(reviewCard, Rating.Easy, nextReview);

    expect(result.card.stability).toBeGreaterThan(reviewCard.stability);
    expect(result.card.state).toBe('review');
  });

  it('Again causes lapse and transitions to relearning', () => {
    const { card: reviewCard, reviewDate } = makeReviewCard();
    const nextReview = new Date(
      reviewDate.getTime() + reviewCard.scheduledDays * 24 * 60 * 60 * 1000,
    );
    const result = schedule(reviewCard, Rating.Again, nextReview);

    expect(result.card.state).toBe('relearning');
    expect(result.card.lapses).toBe(reviewCard.lapses + 1);
    expect(result.card.stability).toBeLessThan(reviewCard.stability);
  });

  it('Good produces a longer interval than Hard', () => {
    const { card: reviewCard, reviewDate } = makeReviewCard();
    const nextReview = new Date(
      reviewDate.getTime() + reviewCard.scheduledDays * 24 * 60 * 60 * 1000,
    );
    const hard = schedule(reviewCard, Rating.Hard, nextReview);
    const good = schedule(reviewCard, Rating.Good, nextReview);

    expect(good.card.scheduledDays).toBeGreaterThanOrEqual(hard.card.scheduledDays);
  });
});

describe('isDue', () => {
  it('new card is due immediately', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const card = createNewCard(now);

    expect(isDue(card, now)).toBe(true);
  });

  it('scheduled card is not due before its due date', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const card = createNewCard(now);
    const result = schedule(card, Rating.Good, now);

    // Check 1 hour after scheduling — should not be due yet
    const soonAfter = new Date(now.getTime() + 60 * 60 * 1000);
    expect(isDue(result.card, soonAfter)).toBe(false);
  });

  it('scheduled card is due after its due date', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const card = createNewCard(now);
    const result = schedule(card, Rating.Good, now);

    // Check well after due date
    const future = new Date(
      result.card.dueDate.getTime() + 24 * 60 * 60 * 1000,
    );
    expect(isDue(result.card, future)).toBe(true);
  });
});

describe('getSchedulingOptions', () => {
  it('returns 4 results for a new card', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const card = createNewCard(now);
    const options = getSchedulingOptions(card, now);

    expect(options[Rating.Again]).toBeDefined();
    expect(options[Rating.Hard]).toBeDefined();
    expect(options[Rating.Good]).toBeDefined();
    expect(options[Rating.Easy]).toBeDefined();

    // Each should have a card and review log
    for (const rating of [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]) {
      expect(options[rating].card).toBeDefined();
      expect(options[rating].reviewLog).toBeDefined();
      expect(options[rating].card.state).toBe('learning');
    }
  });

  it('returns increasing intervals for Again < Hard < Good < Easy on review cards', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const card = createNewCard(now);
    const step1 = schedule(card, Rating.Good, now);
    const day2 = new Date('2025-01-02T00:00:00Z');
    const step2 = schedule(step1.card, Rating.Good, day2);

    const reviewDate = new Date(
      day2.getTime() + step2.card.scheduledDays * 24 * 60 * 60 * 1000,
    );
    const options = getSchedulingOptions(step2.card, reviewDate);

    const againDays = options[Rating.Again].card.scheduledDays;
    const hardDays = options[Rating.Hard].card.scheduledDays;
    const goodDays = options[Rating.Good].card.scheduledDays;
    const easyDays = options[Rating.Easy].card.scheduledDays;

    expect(againDays).toBeLessThanOrEqual(hardDays);
    expect(hardDays).toBeLessThanOrEqual(goodDays);
    expect(goodDays).toBeLessThanOrEqual(easyDays);
  });
});
