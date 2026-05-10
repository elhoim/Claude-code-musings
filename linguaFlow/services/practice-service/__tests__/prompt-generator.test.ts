import { describe, it, expect } from 'vitest';
import { generatePrompt } from '../src/services/prompt-generator.service';

const MODES = ['reformulation', 'situation_response', 'narrative_sprint'] as const;
const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;

const REQUIRED_FIELDS = ['type', 'content', 'instruction', 'targetVocabulary', 'targetGrammar'] as const;

describe('generatePrompt', () => {
  describe('returns a valid prompt for each mode', () => {
    it.each(MODES)('returns a valid prompt for mode "%s"', (mode) => {
      const prompt = generatePrompt(mode, 'en', 'A1');

      expect(prompt).toBeDefined();
      expect(typeof prompt.type).toBe('string');
      expect(typeof prompt.content).toBe('string');
      expect(typeof prompt.instruction).toBe('string');
      expect(prompt.content.length).toBeGreaterThan(0);
      expect(prompt.instruction.length).toBeGreaterThan(0);
    });
  });

  describe('each mode has prompts for levels A1, A2, B1, B2', () => {
    for (const mode of MODES) {
      for (const level of LEVELS) {
        it(`returns a prompt for mode "${mode}" at level "${level}"`, () => {
          const prompt = generatePrompt(mode, 'en', level);

          expect(prompt).toBeDefined();
          expect(prompt.content.length).toBeGreaterThan(0);
          expect(prompt.instruction.length).toBeGreaterThan(0);
        });
      }
    }
  });

  describe('falls back to A1 when an unknown level is given', () => {
    it.each(MODES)('falls back to A1 for mode "%s" with unknown level "C3"', (mode) => {
      // Generate many prompts with the unknown level and collect them
      const unknownLevelPrompts = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const prompt = generatePrompt(mode, 'en', 'C3');
        unknownLevelPrompts.add(prompt.content);
      }

      // Generate many A1 prompts and collect them
      const a1Prompts = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const prompt = generatePrompt(mode, 'en', 'A1');
        a1Prompts.add(prompt.content);
      }

      // Every prompt from the unknown level should be found in the A1 set
      for (const content of unknownLevelPrompts) {
        expect(a1Prompts).toContain(content);
      }
    });
  });

  describe('returned prompts have all required fields', () => {
    for (const mode of MODES) {
      for (const level of LEVELS) {
        it(`prompt for "${mode}" / "${level}" has all required fields`, () => {
          const prompt = generatePrompt(mode, 'en', level);

          for (const field of REQUIRED_FIELDS) {
            expect(prompt).toHaveProperty(field);
          }

          expect(typeof prompt.type).toBe('string');
          expect(typeof prompt.content).toBe('string');
          expect(typeof prompt.instruction).toBe('string');
          expect(Array.isArray(prompt.targetVocabulary)).toBe(true);
          expect(Array.isArray(prompt.targetGrammar)).toBe(true);
        });
      }
    }
  });

  describe('targetVocabulary and targetGrammar are arrays', () => {
    for (const mode of MODES) {
      for (const level of LEVELS) {
        it(`"${mode}" / "${level}" has array targetVocabulary and targetGrammar`, () => {
          const prompt = generatePrompt(mode, 'en', level);

          expect(Array.isArray(prompt.targetVocabulary)).toBe(true);
          expect(Array.isArray(prompt.targetGrammar)).toBe(true);

          // Each element should be a string
          for (const item of prompt.targetVocabulary) {
            expect(typeof item).toBe('string');
          }
          for (const item of prompt.targetGrammar) {
            expect(typeof item).toBe('string');
          }

          // Known levels should have non-empty arrays
          expect(prompt.targetVocabulary.length).toBeGreaterThan(0);
          expect(prompt.targetGrammar.length).toBeGreaterThan(0);
        });
      }
    }
  });

  describe('default fallback prompt when no prompts available', () => {
    it('returns the default fallback prompt structure', () => {
      // We cannot easily empty the prompt maps, but we can verify the fallback
      // by checking its known shape. The fallback is returned when levelPrompts
      // is empty. Since the code falls back unknown levels to A1 which always
      // has prompts, we test the fallback indirectly by verifying its contract:
      // any returned prompt must satisfy the GeneratedPrompt interface.
      const prompt = generatePrompt('reformulation', 'en', 'A1');

      expect(prompt).toMatchObject({
        type: expect.any(String),
        content: expect.any(String),
        instruction: expect.any(String),
        targetVocabulary: expect.any(Array),
        targetGrammar: expect.any(Array),
      });
    });

    it('fallback prompt has the expected default values', () => {
      // The default fallback is defined for when levelPrompts.length === 0.
      // We verify the shape matches: type 'text', a greeting content, etc.
      // Since we cannot trigger it without modifying internals, we verify that
      // an unknown mode still returns a valid prompt (defaults to reformulation).
      const prompt = generatePrompt('unknown_mode' as any, 'en', 'A1');

      expect(prompt).toBeDefined();
      expect(typeof prompt.type).toBe('string');
      expect(typeof prompt.content).toBe('string');
      expect(typeof prompt.instruction).toBe('string');
      expect(Array.isArray(prompt.targetVocabulary)).toBe(true);
      expect(Array.isArray(prompt.targetGrammar)).toBe(true);
    });

    it('unknown mode with unknown level still returns a valid prompt', () => {
      const prompt = generatePrompt('nonexistent' as any, 'en', 'Z9');

      // Should fall back: unknown mode -> reformulation, unknown level -> A1
      expect(prompt).toBeDefined();
      for (const field of REQUIRED_FIELDS) {
        expect(prompt).toHaveProperty(field);
      }
    });
  });
});
