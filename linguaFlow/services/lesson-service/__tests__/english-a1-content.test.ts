import { describe, it, expect } from 'vitest';
import {
  ENGLISH_A1_UNITS,
  ENGLISH_A1_PLACEMENT_QUESTIONS,
} from '../src/db/seeds/english-a1-content';

const VALID_EXERCISE_TYPES = [
  'multiple_choice',
  'fill_blank',
  'translation',
  'matching',
  'reorder',
] as const;

describe('ENGLISH_A1_UNITS', () => {
  it('has exactly 4 units', () => {
    expect(ENGLISH_A1_UNITS).toHaveLength(4);
  });

  describe('each unit has 5 lessons', () => {
    ENGLISH_A1_UNITS.forEach((unit, unitIndex) => {
      it(`unit ${unitIndex} ("${unit.title}") has 5 lessons`, () => {
        expect(unit.lessons).toHaveLength(5);
      });
    });
  });

  describe('each lesson has at least 3 exercises', () => {
    ENGLISH_A1_UNITS.forEach((unit, unitIndex) => {
      unit.lessons.forEach((lesson, lessonIndex) => {
        it(`unit ${unitIndex}, lesson ${lessonIndex} ("${lesson.title}") has >= 3 exercises`, () => {
          expect(lesson.exercises.length).toBeGreaterThanOrEqual(3);
        });
      });
    });
  });

  describe('exercise types are valid', () => {
    ENGLISH_A1_UNITS.forEach((unit, unitIndex) => {
      unit.lessons.forEach((lesson, lessonIndex) => {
        lesson.exercises.forEach((exercise, exerciseIndex) => {
          it(`unit ${unitIndex}, lesson ${lessonIndex}, exercise ${exerciseIndex} has a valid type ("${exercise.type}")`, () => {
            expect(VALID_EXERCISE_TYPES).toContain(exercise.type);
          });
        });
      });
    });
  });

  describe('all exercises have promptText and correctAnswer', () => {
    ENGLISH_A1_UNITS.forEach((unit, unitIndex) => {
      unit.lessons.forEach((lesson, lessonIndex) => {
        lesson.exercises.forEach((exercise, exerciseIndex) => {
          it(`unit ${unitIndex}, lesson ${lessonIndex}, exercise ${exerciseIndex} has promptText and correctAnswer`, () => {
            expect(exercise.promptText).toBeDefined();
            expect(typeof exercise.promptText).toBe('string');
            expect(exercise.promptText.length).toBeGreaterThan(0);

            expect(exercise.correctAnswer).toBeDefined();
            expect(typeof exercise.correctAnswer).toBe('string');
            expect(exercise.correctAnswer.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });
});

describe('ENGLISH_A1_PLACEMENT_QUESTIONS', () => {
  it('has questions for A1 level', () => {
    const a1Questions = ENGLISH_A1_PLACEMENT_QUESTIONS.filter(
      (q) => q.cefrLevel === 'A1',
    );
    expect(a1Questions.length).toBeGreaterThan(0);
  });

  it('has questions for A2 level', () => {
    const a2Questions = ENGLISH_A1_PLACEMENT_QUESTIONS.filter(
      (q) => q.cefrLevel === 'A2',
    );
    expect(a2Questions.length).toBeGreaterThan(0);
  });

  it('has questions for B1 level', () => {
    const b1Questions = ENGLISH_A1_PLACEMENT_QUESTIONS.filter(
      (q) => q.cefrLevel === 'B1',
    );
    expect(b1Questions.length).toBeGreaterThan(0);
  });

  describe('each placement question has a distractors array', () => {
    ENGLISH_A1_PLACEMENT_QUESTIONS.forEach((question, index) => {
      it(`question ${index} ("${question.promptText.slice(0, 40)}…") has distractors`, () => {
        expect(Array.isArray(question.distractors)).toBe(true);
        expect(question.distractors.length).toBeGreaterThan(0);
      });
    });
  });
});
