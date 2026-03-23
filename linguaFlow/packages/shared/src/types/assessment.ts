import type { CefrLevel, LanguageCode, SkillDimension } from '../constants';

export interface FluencyDiagnostic {
  id: string;
  userId: string;
  language: LanguageCode;
  scheduledAt: Date;
  completedAt?: Date;
  sections: DiagnosticSection[];
  result?: DiagnosticResult;
}

export interface DiagnosticSection {
  skill: SkillDimension;
  questions: DiagnosticQuestion[];
  score?: number;
  estimatedLevel?: CefrLevel;
}

export interface DiagnosticQuestion {
  id: string;
  skill: SkillDimension;
  cefrLevel: CefrLevel;
  type: 'reading_comprehension' | 'listening_comprehension' | 'writing_prompt' | 'speaking_prompt';
  prompt: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer?: string;
  rubric?: string;
  userAnswer?: string;
  score?: number;
}

export interface DiagnosticResult {
  overallLevel: CefrLevel;
  skillLevels: Record<SkillDimension, CefrLevel>;
  skillScores: Record<SkillDimension, number>;
  vocabularyBreadth: number;
  grammarRange: number;
  pronunciationAccuracy?: number;
  recommendations: string[];
  comparedToPrevious?: {
    overallChange: number;
    skillChanges: Record<SkillDimension, number>;
  };
}

export interface DiagnosticHistory {
  userId: string;
  language: LanguageCode;
  diagnostics: {
    id: string;
    completedAt: Date;
    overallLevel: CefrLevel;
    skillLevels: Record<SkillDimension, CefrLevel>;
  }[];
}
