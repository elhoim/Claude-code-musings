/**
 * Shared types for story seed data files.
 * All language-specific story seed files should import from here.
 */

export interface StorySegmentSeed {
  order: number;
  text: string;
  translation: string;
  annotations: {
    startIndex: number;
    endIndex: number;
    word: string;
    definition: string;
    partOfSpeech?: string;
  }[];
  choices?: {
    id: string;
    text: string;
    translation: string;
    nextSegmentOrder: number;
  }[];
  promptForUser?: {
    type: string;
    instruction: string;
    minWords?: number;
  };
}

export interface StorySeed {
  language: string;
  cefrLevel: string;
  title: string;
  description: string;
  genre: string;
  isTemplate: boolean;
  estimatedMinutes: number;
  vocabularyTargets: string[];
  grammarTargets: string[];
  segments: StorySegmentSeed[];
}
