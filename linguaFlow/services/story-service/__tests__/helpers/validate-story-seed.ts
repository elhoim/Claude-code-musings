import { describe, it, expect } from 'vitest';
import type { StorySeed } from '../../src/db/seeds/story-seed-types';

const REQUIRED_STORY_FIELDS = [
  'language',
  'cefrLevel',
  'title',
  'description',
  'genre',
  'isTemplate',
  'estimatedMinutes',
  'vocabularyTargets',
  'grammarTargets',
  'segments',
] as const;

export function describeStorySeedData(
  label: string,
  stories: StorySeed[],
  expectedCount: number = 3,
) {
  describe(label, () => {
    it(`has exactly ${expectedCount} stories`, () => {
      expect(stories).toHaveLength(expectedCount);
    });

    describe('each story has all required fields', () => {
      stories.forEach((story, index) => {
        REQUIRED_STORY_FIELDS.forEach((field) => {
          it(`story ${index} ("${story.title}") has field "${field}"`, () => {
            expect(story).toHaveProperty(field);
          });
        });
      });
    });

    describe('each story has at least 3 segments', () => {
      stories.forEach((story, index) => {
        it(`story ${index} ("${story.title}") has >= 3 segments`, () => {
          expect(story.segments.length).toBeGreaterThanOrEqual(3);
        });
      });
    });

    describe('segments with choices have valid nextSegmentOrder references', () => {
      stories.forEach((story, storyIndex) => {
        const segmentOrders = new Set(story.segments.map((s) => s.order));

        story.segments.forEach((segment) => {
          if (segment.choices) {
            segment.choices.forEach((choice) => {
              it(`story ${storyIndex}, segment ${segment.order}, choice "${choice.id}" references valid order ${choice.nextSegmentOrder}`, () => {
                expect(segmentOrders.has(choice.nextSegmentOrder)).toBe(true);
              });
            });
          }
        });
      });
    });

    describe('annotations have valid fields', () => {
      stories.forEach((story, storyIndex) => {
        story.segments.forEach((segment) => {
          segment.annotations.forEach((annotation, annIndex) => {
            it(`story ${storyIndex}, segment ${segment.order}, annotation ${annIndex} ("${annotation.word}") is valid`, () => {
              expect(typeof annotation.startIndex).toBe('number');
              expect(typeof annotation.endIndex).toBe('number');
              expect(annotation.startIndex).toBeGreaterThanOrEqual(0);
              expect(annotation.endIndex).toBeGreaterThan(annotation.startIndex);
              expect(annotation.word.length).toBeGreaterThan(0);
              expect(annotation.definition.length).toBeGreaterThan(0);
            });
          });
        });
      });
    });

    it('at least one story has a segment with promptForUser', () => {
      const hasPrompt = stories.some((story) =>
        story.segments.some((segment) => segment.promptForUser !== undefined),
      );
      expect(hasPrompt).toBe(true);
    });
  });
}
