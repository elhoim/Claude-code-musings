export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const CEFR_ORDER: Record<CefrLevel, number> = {
  A1: 0,
  A2: 1,
  B1: 2,
  B2: 3,
  C1: 4,
  C2: 5,
};

export function cefrIsAtLeast(level: CefrLevel, minimum: CefrLevel): boolean {
  return CEFR_ORDER[level] >= CEFR_ORDER[minimum];
}

export const SKILL_DIMENSIONS = [
  'reading',
  'writing',
  'listening',
  'speaking',
] as const;
export type SkillDimension = (typeof SKILL_DIMENSIONS)[number];
