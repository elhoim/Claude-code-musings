import { create } from 'zustand';

interface LearningPath {
  id: string;
  languageCode: string;
  units: Array<{
    id: string;
    level: string;
    title: string;
    lessonIds: string[];
  }>;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  exercises: unknown[];
}

interface UserLessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  completedAt: string;
}

interface LearningState {
  currentLanguage: string | null;
  currentLevel: string;
  learningPath: LearningPath | null;
  currentLesson: Lesson | null;
  progress: UserLessonProgress[];
  isLoading: boolean;

  setCurrentLanguage: (lang: string) => void;
  setLevel: (level: string) => void;
  setLearningPath: (path: LearningPath) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  completeLesson: (lessonId: string, score: number) => void;
  loadPath: () => Promise<void>;
  addProgress: (progress: UserLessonProgress) => void;
  setLoading: (loading: boolean) => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  currentLanguage: null,
  currentLevel: 'A1',
  learningPath: null,
  currentLesson: null,
  progress: [],
  isLoading: false,

  setCurrentLanguage: (currentLanguage) => set({ currentLanguage }),
  setLevel: (currentLevel) => set({ currentLevel }),
  setLearningPath: (learningPath) => set({ learningPath }),
  setCurrentLesson: (currentLesson) => set({ currentLesson }),

  completeLesson: (lessonId, score) =>
    set((state) => ({
      progress: [
        ...state.progress.filter((p) => p.lessonId !== lessonId),
        {
          lessonId,
          completed: true,
          score,
          completedAt: new Date().toISOString(),
        },
      ],
    })),

  loadPath: async () => {
    set({ isLoading: true });
    // Placeholder: would fetch learning path from API
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  addProgress: (p) =>
    set((state) => ({
      progress: [...state.progress.filter((x) => x.lessonId !== p.lessonId), p],
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
