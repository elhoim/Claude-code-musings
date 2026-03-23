/**
 * Generate a simple unique ID (for client-side use).
 * Server-side should use crypto.randomUUID() or database-generated UUIDs.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Format minutes into a human-readable duration string */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

/** Calculate XP needed for a given level */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/** Calculate the level for a given total XP */
export function levelFromXp(totalXp: number): number {
  let level = 1;
  let xpNeeded = 100;
  let accumulated = 0;
  while (accumulated + xpNeeded <= totalXp) {
    accumulated += xpNeeded;
    level++;
    xpNeeded = Math.floor(100 * Math.pow(1.5, level - 1));
  }
  return level;
}

/** Calculate percentage progress toward next level */
export function xpProgress(totalXp: number): { level: number; current: number; needed: number; percent: number } {
  let level = 1;
  let xpNeeded = 100;
  let accumulated = 0;
  while (accumulated + xpNeeded <= totalXp) {
    accumulated += xpNeeded;
    level++;
    xpNeeded = Math.floor(100 * Math.pow(1.5, level - 1));
  }
  const current = totalXp - accumulated;
  return {
    level,
    current,
    needed: xpNeeded,
    percent: Math.round((current / xpNeeded) * 100),
  };
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Check if a date is today */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/** Format a date as YYYY-MM-DD */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
