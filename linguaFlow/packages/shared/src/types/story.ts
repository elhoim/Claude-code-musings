import type { CefrLevel, LanguageCode } from '../constants';

export interface Story {
  id: string;
  language: LanguageCode;
  cefrLevel: CefrLevel;
  title: string;
  description: string;
  genre: StoryGenre;
  coverImageUrl?: string;
  isTemplate: boolean;
  segmentCount: number;
  estimatedMinutes: number;
  vocabularyTargets: string[];
  grammarTargets: string[];
  createdAt: Date;
}

export type StoryGenre =
  | 'adventure'
  | 'mystery'
  | 'romance'
  | 'sci_fi'
  | 'slice_of_life'
  | 'historical'
  | 'thriller';

export interface StorySegment {
  id: string;
  storyId: string;
  order: number;
  text: string;
  translation: string;
  audioUrl?: string;
  annotations: TextAnnotation[];
  choices?: StoryChoice[];
  promptForUser?: StoryPrompt;
}

export interface TextAnnotation {
  startIndex: number;
  endIndex: number;
  word: string;
  definition: string;
  pronunciation?: string;
  partOfSpeech?: string;
  grammarNodeId?: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  translation: string;
  nextSegmentId: string;
  requiresLevel?: CefrLevel;
}

export interface StoryPrompt {
  type: 'write_response' | 'predict_next' | 'describe_scene' | 'character_journal';
  instruction: string;
  minWords?: number;
}

export interface UserStoryState {
  id: string;
  userId: string;
  storyId: string;
  currentSegmentId: string;
  choiceHistory: string[];
  completedSegments: number;
  totalSegments: number;
  startedAt: Date;
  lastReadAt: Date;
  completedAt?: Date;
}
