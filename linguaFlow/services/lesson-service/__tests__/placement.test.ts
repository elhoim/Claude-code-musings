import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/client.js', () => ({
  db: {
    query: {
      placementQuestions: {
        findMany: vi.fn(),
      },
    },
  },
}));

import { db } from '../db/client.js';
import { getPlacementTest, evaluatePlacement } from '../src/services/placement.service.js';

const findMany = db.query.placementQuestions.findMany as ReturnType<typeof vi.fn>;

function makeQuestion(id: string, level: string, correctAnswer: string) {
  return {
    id,
    language: 'en',
    cefrLevel: level,
    prompt: `Question ${id}`,
    correctAnswer,
  };
}

beforeEach(() => {
  findMany.mockReset();
});

// ---------------------------------------------------------------------------
// getPlacementTest
// ---------------------------------------------------------------------------
describe('getPlacementTest', () => {
  it('strips correctAnswer from returned questions', async () => {
    findMany.mockResolvedValue([
      makeQuestion('q1', 'A1', 'apple'),
      makeQuestion('q2', 'A1', 'banana'),
    ]);

    const result = await getPlacementTest('en');

    for (const q of result) {
      expect(q).not.toHaveProperty('correctAnswer');
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('cefrLevel');
    }
  });

  it('returns at most QUESTIONS_PER_LEVEL (5) per level', async () => {
    const pool = Array.from({ length: 8 }, (_, i) =>
      makeQuestion(`a1-${i}`, 'A1', `answer-${i}`),
    );
    findMany.mockResolvedValue(pool);

    const result = await getPlacementTest('en');

    expect(result.length).toBeLessThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// evaluatePlacement
// ---------------------------------------------------------------------------
describe('evaluatePlacement', () => {
  it('returns at least A1 when all A1 answers are correct', async () => {
    const questions = [
      makeQuestion('q1', 'A1', 'apple'),
      makeQuestion('q2', 'A1', 'banana'),
      makeQuestion('q3', 'A1', 'cherry'),
    ];
    findMany.mockResolvedValue(questions);

    const result = await evaluatePlacement('en', [
      { questionId: 'q1', answer: 'apple' },
      { questionId: 'q2', answer: 'banana' },
      { questionId: 'q3', answer: 'cherry' },
    ]);

    expect(result.cefrLevel).toBe('A1');
    expect(result.correctCount).toBe(3);
    expect(result.totalCount).toBe(3);
  });

  it('returns A2 when all A1 and A2 answers are correct', async () => {
    const questions = [
      makeQuestion('q1', 'A1', 'apple'),
      makeQuestion('q2', 'A1', 'banana'),
      makeQuestion('q3', 'A2', 'dog'),
      makeQuestion('q4', 'A2', 'cat'),
    ];
    findMany.mockResolvedValue(questions);

    const result = await evaluatePlacement('en', [
      { questionId: 'q1', answer: 'apple' },
      { questionId: 'q2', answer: 'banana' },
      { questionId: 'q3', answer: 'dog' },
      { questionId: 'q4', answer: 'cat' },
    ]);

    expect(result.cefrLevel).toBe('A2');
    expect(result.correctCount).toBe(4);
    expect(result.totalCount).toBe(4);
  });

  it('defaults to A1 when no answers are correct', async () => {
    const questions = [
      makeQuestion('q1', 'A1', 'apple'),
      makeQuestion('q2', 'A2', 'dog'),
    ];
    findMany.mockResolvedValue(questions);

    const result = await evaluatePlacement('en', [
      { questionId: 'q1', answer: 'wrong' },
      { questionId: 'q2', answer: 'wrong' },
    ]);

    expect(result.cefrLevel).toBe('A1');
    expect(result.correctCount).toBe(0);
    expect(result.totalCount).toBe(2);
  });

  it('defaults to A1 when answers array is empty', async () => {
    findMany.mockResolvedValue([]);

    const result = await evaluatePlacement('en', []);

    expect(result.cefrLevel).toBe('A1');
    expect(result.correctCount).toBe(0);
    expect(result.totalCount).toBe(0);
  });

  it('promotes level only when ratio meets 60% threshold', async () => {
    // 5 A1 questions: 3 correct (60%) -> qualifies
    // 5 A2 questions: 2 correct (40%) -> does NOT qualify
    const questions = [
      makeQuestion('a1-1', 'A1', 'a'),
      makeQuestion('a1-2', 'A1', 'b'),
      makeQuestion('a1-3', 'A1', 'c'),
      makeQuestion('a1-4', 'A1', 'd'),
      makeQuestion('a1-5', 'A1', 'e'),
      makeQuestion('a2-1', 'A2', 'f'),
      makeQuestion('a2-2', 'A2', 'g'),
      makeQuestion('a2-3', 'A2', 'h'),
      makeQuestion('a2-4', 'A2', 'i'),
      makeQuestion('a2-5', 'A2', 'j'),
    ];
    findMany.mockResolvedValue(questions);

    const result = await evaluatePlacement('en', [
      { questionId: 'a1-1', answer: 'a' },
      { questionId: 'a1-2', answer: 'b' },
      { questionId: 'a1-3', answer: 'c' },
      { questionId: 'a1-4', answer: 'wrong' },
      { questionId: 'a1-5', answer: 'wrong' },
      { questionId: 'a2-1', answer: 'f' },
      { questionId: 'a2-2', answer: 'g' },
      { questionId: 'a2-3', answer: 'wrong' },
      { questionId: 'a2-4', answer: 'wrong' },
      { questionId: 'a2-5', answer: 'wrong' },
    ]);

    expect(result.cefrLevel).toBe('A1');
    expect(result.correctCount).toBe(5);
    expect(result.totalCount).toBe(10);
  });

  it('promotes level when ratio is exactly 60%', async () => {
    // 5 A1 questions: 3 correct = 60% -> qualifies
    const questions = [
      makeQuestion('a1-1', 'A1', 'a'),
      makeQuestion('a1-2', 'A1', 'b'),
      makeQuestion('a1-3', 'A1', 'c'),
      makeQuestion('a1-4', 'A1', 'd'),
      makeQuestion('a1-5', 'A1', 'e'),
    ];
    findMany.mockResolvedValue(questions);

    const result = await evaluatePlacement('en', [
      { questionId: 'a1-1', answer: 'a' },
      { questionId: 'a1-2', answer: 'b' },
      { questionId: 'a1-3', answer: 'c' },
      { questionId: 'a1-4', answer: 'wrong' },
      { questionId: 'a1-5', answer: 'wrong' },
    ]);

    expect(result.cefrLevel).toBe('A1');
    expect(result.correctCount).toBe(3);
    expect(result.totalCount).toBe(5);
  });

  it('does not promote level when ratio is just below 60%', async () => {
    // 5 A2 questions: 2 correct = 40% -> does NOT qualify
    // A1 is skipped (no answers), so falls back to default A1
    const questions = [
      makeQuestion('a2-1', 'A2', 'f'),
      makeQuestion('a2-2', 'A2', 'g'),
      makeQuestion('a2-3', 'A2', 'h'),
      makeQuestion('a2-4', 'A2', 'i'),
      makeQuestion('a2-5', 'A2', 'j'),
    ];
    findMany.mockResolvedValue(questions);

    const result = await evaluatePlacement('en', [
      { questionId: 'a2-1', answer: 'f' },
      { questionId: 'a2-2', answer: 'g' },
      { questionId: 'a2-3', answer: 'wrong' },
      { questionId: 'a2-4', answer: 'wrong' },
      { questionId: 'a2-5', answer: 'wrong' },
    ]);

    expect(result.cefrLevel).toBe('A1');
    expect(result.correctCount).toBe(2);
    expect(result.totalCount).toBe(5);
  });

  it('skips answers for unknown question IDs', async () => {
    const questions = [makeQuestion('q1', 'A1', 'apple')];
    findMany.mockResolvedValue(questions);

    const result = await evaluatePlacement('en', [
      { questionId: 'q1', answer: 'apple' },
      { questionId: 'unknown-id', answer: 'whatever' },
    ]);

    expect(result.cefrLevel).toBe('A1');
    expect(result.correctCount).toBe(1);
    expect(result.totalCount).toBe(1);
  });

  it('comparison is case-insensitive and trims whitespace', async () => {
    const questions = [makeQuestion('q1', 'A1', 'Apple')];
    findMany.mockResolvedValue(questions);

    const result = await evaluatePlacement('en', [
      { questionId: 'q1', answer: '  apple  ' },
    ]);

    expect(result.correctCount).toBe(1);
  });

  it('reaches higher CEFR levels when all levels pass threshold', async () => {
    const questions = [
      makeQuestion('a1-1', 'A1', 'a'),
      makeQuestion('a2-1', 'A2', 'b'),
      makeQuestion('b1-1', 'B1', 'c'),
      makeQuestion('b2-1', 'B2', 'd'),
      makeQuestion('c1-1', 'C1', 'e'),
      makeQuestion('c2-1', 'C2', 'f'),
    ];
    findMany.mockResolvedValue(questions);

    const result = await evaluatePlacement('en', [
      { questionId: 'a1-1', answer: 'a' },
      { questionId: 'a2-1', answer: 'b' },
      { questionId: 'b1-1', answer: 'c' },
      { questionId: 'b2-1', answer: 'd' },
      { questionId: 'c1-1', answer: 'e' },
      { questionId: 'c2-1', answer: 'f' },
    ]);

    expect(result.cefrLevel).toBe('C2');
    expect(result.correctCount).toBe(6);
    expect(result.totalCount).toBe(6);
  });

  it('returns highest passing level even if a lower level fails', async () => {
    // A1: 0/1 = 0% (fail), A2: 1/1 = 100% (pass)
    // The algorithm walks levels in order and updates estimatedLevel
    // whenever a level passes, so A2 should be the result.
    const questions = [
      makeQuestion('a1-1', 'A1', 'a'),
      makeQuestion('a2-1', 'A2', 'b'),
    ];
    findMany.mockResolvedValue(questions);

    const result = await evaluatePlacement('en', [
      { questionId: 'a1-1', answer: 'wrong' },
      { questionId: 'a2-1', answer: 'b' },
    ]);

    expect(result.cefrLevel).toBe('A2');
    expect(result.correctCount).toBe(1);
    expect(result.totalCount).toBe(2);
  });
});
