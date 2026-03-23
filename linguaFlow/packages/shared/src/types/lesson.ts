import type { CefrLevel, LanguageCode } from '../constants';

export interface Unit {
  id: string;
  language: LanguageCode;
  cefrLevel: CefrLevel;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  language: LanguageCode;
  cefrLevel: CefrLevel;
  title: string;
  description: string;
  type: LessonType;
  estimatedMinutes: number;
  xpReward: number;
  order: number;
  exercises: Exercise[];
}

export type LessonType =
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'speaking'
  | 'cultural';

export interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  prompt: ExercisePrompt;
  correctAnswer: string | string[];
  distractors?: string[];
  hints?: string[];
  audioUrl?: string;
  imageUrl?: string;
  order: number;
}

export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'translation'
  | 'listening'
  | 'speaking'
  | 'matching'
  | 'reorder'
  | 'free_write'
  | 'cloze';

export interface ExercisePrompt {
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  targetLanguage?: boolean;
}

export interface UserLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  bestScore: number;
  attempts: number;
  completedAt?: Date;
  updatedAt: Date;
}

export interface PlacementTestQuestion {
  id: string;
  language: LanguageCode;
  cefrLevel: CefrLevel;
  type: ExerciseType;
  prompt: ExercisePrompt;
  correctAnswer: string;
  distractors: string[];
}

export interface PlacementTestResult {
  language: LanguageCode;
  estimatedLevel: CefrLevel;
  scoreByLevel: Record<CefrLevel, number>;
  totalQuestions: number;
  correctAnswers: number;
}

export interface LearningPath {
  language: LanguageCode;
  currentLevel: CefrLevel;
  units: Unit[];
  completedLessonIds: string[];
  nextLessonId?: string;
}
