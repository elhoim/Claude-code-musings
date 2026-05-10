import type { CefrLevel, LanguageCode } from '../constants';

export interface DrillSession {
  id: string;
  userId: string;
  mode: DrillMode;
  language: LanguageCode;
  cefrLevel: CefrLevel;
  timeLimitSeconds: number;
  prompt: DrillPrompt;
  response?: DrillResponse;
  feedback?: DrillFeedback;
  startedAt: Date;
  completedAt?: Date;
}

export type DrillMode = 'reformulation' | 'situation_response' | 'narrative_sprint';

export const DRILL_MODE_INFO: Record<DrillMode, { label: string; description: string; defaultTimeSeconds: number }> = {
  reformulation: {
    label: 'Reformulation',
    description: 'Change the sentence as instructed (tense, subject, question form, etc.)',
    defaultTimeSeconds: 30,
  },
  situation_response: {
    label: 'Situation Response',
    description: 'Listen to a scenario and respond naturally within the time limit',
    defaultTimeSeconds: 8,
  },
  narrative_sprint: {
    label: 'Narrative Sprint',
    description: 'Tell a story or argue a position based on a prompt',
    defaultTimeSeconds: 60,
  },
};

export interface DrillPrompt {
  type: 'image' | 'text' | 'audio' | 'scenario';
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  instruction: string;
  targetVocabulary?: string[];
  targetGrammar?: string[];
}

export interface DrillResponse {
  audioUrl: string;
  transcription: string;
  durationSeconds: number;
}

export interface DrillFeedback {
  overallScore: number;
  communicativeSuccess: number;
  fluencyScore: number;
  accuracyScore: number;
  complexityScore: number;
  pronunciationScore?: number;
  corrections: GrammarCorrection[];
  suggestedVocabulary: string[];
  modelResponse?: string;
  encouragement: string;
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  grammarNodeId?: string;
}
