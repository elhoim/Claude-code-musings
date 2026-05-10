import type { FsrsCard, FsrsParameters, SchedulingResult } from './types';
import { Rating } from './types';
import { schedule, DEFAULT_PARAMETERS } from './fsrs';

/**
 * A map of all four possible scheduling outcomes for a card.
 */
export interface SchedulingOptions {
  [Rating.Again]: SchedulingResult;
  [Rating.Hard]: SchedulingResult;
  [Rating.Good]: SchedulingResult;
  [Rating.Easy]: SchedulingResult;
}

/**
 * Returns all 4 possible scheduling results for a card (one per rating).
 * Useful for showing the user what each button would do, e.g.:
 *   "Again: <1d, Hard: 3d, Good: 7d, Easy: 14d"
 */
export function getSchedulingOptions(
  card: FsrsCard,
  now?: Date,
  params?: FsrsParameters,
): SchedulingOptions {
  const p = params ?? DEFAULT_PARAMETERS;
  const reviewDate = now ?? new Date();

  return {
    [Rating.Again]: schedule(card, Rating.Again, reviewDate, p),
    [Rating.Hard]: schedule(card, Rating.Hard, reviewDate, p),
    [Rating.Good]: schedule(card, Rating.Good, reviewDate, p),
    [Rating.Easy]: schedule(card, Rating.Easy, reviewDate, p),
  };
}

/**
 * Returns true if the card is due for review at the given time.
 */
export function isDue(card: FsrsCard, now?: Date): boolean {
  const date = now ?? new Date();
  return card.dueDate.getTime() <= date.getTime();
}

/**
 * Filters cards that are due and sorts them by due date (earliest first).
 */
export function getDueCards(cards: FsrsCard[], now?: Date): FsrsCard[] {
  const date = now ?? new Date();
  return cards
    .filter((card) => isDue(card, date))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}
