import { describe, it, expect } from 'vitest';

const VALID_EXERCISE_TYPES = [
  'multiple_choice',
  'fill_blank',
  'translation',
  'matching',
  'reorder',
] as const;

interface UnitSeed {
  title: string;
  lessons: {
    title: string;
    exercises: {
      type: string;
      promptText: string;
      correctAnswer: string;
    }[];
  }[];
}

interface PlacementQuestionSeed {
  cefrLevel: string;
  promptText: string;
  distractors: string[];
}

export function describeLessonSeedData(
  label: string,
  units: UnitSeed[],
  placementQuestions: PlacementQuestionSeed[],
) {
  describe(label, () => {
    it('has exactly 4 units', () => {
      expect(units).toHaveLength(4);
    });

    describe('each unit has 5 lessons', () => {
      units.forEach((unit, unitIndex) => {
        it(`unit ${unitIndex} ("${unit.title}") has 5 lessons`, () => {
          expect(unit.lessons).toHaveLength(5);
        });
      });
    });

    describe('each lesson has at least 3 exercises', () => {
      units.forEach((unit, unitIndex) => {
        unit.lessons.forEach((lesson, lessonIndex) => {
          it(`unit ${unitIndex}, lesson ${lessonIndex} ("${lesson.title}") has >= 3 exercises`, () => {
            expect(lesson.exercises.length).toBeGreaterThanOrEqual(3);
          });
        });
      });
    });

    describe('exercise types are valid', () => {
      units.forEach((unit, unitIndex) => {
        unit.lessons.forEach((lesson, lessonIndex) => {
          lesson.exercises.forEach((exercise, exerciseIndex) => {
            it(`unit ${unitIndex}, lesson ${lessonIndex}, exercise ${exerciseIndex} type "${exercise.type}" is valid`, () => {
              expect(VALID_EXERCISE_TYPES).toContain(exercise.type);
            });
          });
        });
      });
    });

    describe('all exercises have promptText and correctAnswer', () => {
      units.forEach((unit, unitIndex) => {
        unit.lessons.forEach((lesson, lessonIndex) => {
          lesson.exercises.forEach((exercise, exerciseIndex) => {
            it(`unit ${unitIndex}, lesson ${lessonIndex}, exercise ${exerciseIndex} has content`, () => {
              expect(exercise.promptText.length).toBeGreaterThan(0);
              expect(exercise.correctAnswer.length).toBeGreaterThan(0);
            });
          });
        });
      });
    });
  });

  describe(`${label} placement questions`, () => {
    for (const level of ['A1', 'A2', 'B1']) {
      it(`has questions for ${level} level`, () => {
        const count = placementQuestions.filter((q) => q.cefrLevel === level).length;
        expect(count).toBeGreaterThan(0);
      });
    }

    describe('each question has distractors', () => {
      placementQuestions.forEach((question, index) => {
        it(`question ${index} ("${question.promptText.slice(0, 40)}...") has distractors`, () => {
          expect(Array.isArray(question.distractors)).toBe(true);
          expect(question.distractors.length).toBeGreaterThan(0);
        });
      });
    });
  });
}
