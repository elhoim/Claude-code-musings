import type { CefrLevel, LanguageCode } from '../constants';

export interface GrammarNode {
  id: string;
  language: LanguageCode;
  slug: string;
  name: string;
  nameInTarget: string;
  cefrLevel: CefrLevel;
  category: GrammarCategory;
  shortDescription: string;
  fullExplanation?: string;
  prerequisites: string[];
  examples: GrammarExample[];
  order: number;
  createdAt: Date;
}

export type GrammarCategory =
  | 'verb'
  | 'noun'
  | 'pronoun'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'syntax'
  | 'phonology';

export interface GrammarExample {
  target: string;
  native: string;
  audioUrl?: string;
  highlightRange: [number, number];
  notes?: string;
}

export interface GrammarEdge {
  fromNodeId: string;
  toNodeId: string;
  relationship: 'prerequisite' | 'related' | 'builds_on';
}

export interface UserGrammarProgress {
  id: string;
  userId: string;
  grammarNodeId: string;
  status: GrammarMasteryStatus;
  masteryScore: number;
  practiceCount: number;
  correctCount: number;
  lastPracticedAt?: Date;
  updatedAt: Date;
}

export type GrammarMasteryStatus = 'locked' | 'available' | 'in_progress' | 'mastered';

export interface GrammarGraph {
  language: LanguageCode;
  nodes: GrammarNode[];
  edges: GrammarEdge[];
}

export interface WhyExplanation {
  grammarNodeId: string;
  sentence: string;
  explanation: string;
  relatedExamples: GrammarExample[];
  practiceLink?: string;
}
