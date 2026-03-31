import { describe, it, expect } from 'vitest';
import { ENGLISH_A1_STORIES } from '../src/db/seeds/english-a1-stories';

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

describe('ENGLISH_A1_STORIES', () => {
  it('has exactly 3 stories', () => {
    expect(ENGLISH_A1_STORIES).toHaveLength(3);
  });

  describe('each story has all required fields', () => {
    ENGLISH_A1_STORIES.forEach((story, index) => {
      REQUIRED_STORY_FIELDS.forEach((field) => {
        it(`story ${index} ("${story.title}") has field "${field}"`, () => {
          expect(story).toHaveProperty(field);
        });
      });
    });
  });

  describe('each story has at least 3 segments', () => {
    ENGLISH_A1_STORIES.forEach((story, index) => {
      it(`story ${index} ("${story.title}") has >= 3 segments`, () => {
        expect(story.segments.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('segments with choices have valid nextSegmentOrder references', () => {
    ENGLISH_A1_STORIES.forEach((story, storyIndex) => {
      const segmentOrders = new Set(story.segments.map((s) => s.order));

      story.segments.forEach((segment) => {
        if (segment.choices) {
          segment.choices.forEach((choice) => {
            it(`story ${storyIndex} ("${story.title}"), segment ${segment.order}, choice "${choice.id}" references valid nextSegmentOrder ${choice.nextSegmentOrder}`, () => {
              expect(segmentOrders.has(choice.nextSegmentOrder)).toBe(true);
            });
          });
        }
      });
    });
  });

  describe('annotations have valid fields', () => {
    ENGLISH_A1_STORIES.forEach((story, storyIndex) => {
      story.segments.forEach((segment) => {
        segment.annotations.forEach((annotation, annIndex) => {
          it(`story ${storyIndex}, segment ${segment.order}, annotation ${annIndex} ("${annotation.word}") has valid fields`, () => {
            expect(typeof annotation.startIndex).toBe('number');
            expect(typeof annotation.endIndex).toBe('number');
            expect(annotation.startIndex).toBeGreaterThanOrEqual(0);
            expect(annotation.endIndex).toBeGreaterThan(annotation.startIndex);
            expect(typeof annotation.word).toBe('string');
            expect(annotation.word.length).toBeGreaterThan(0);
            expect(typeof annotation.definition).toBe('string');
            expect(annotation.definition.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  it('at least one story has a segment with promptForUser', () => {
    const hasPrompt = ENGLISH_A1_STORIES.some((story) =>
      story.segments.some((segment) => segment.promptForUser !== undefined),
    );
    expect(hasPrompt).toBe(true);
  });
});
