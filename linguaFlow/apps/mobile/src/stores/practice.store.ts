import { create } from 'zustand';

interface DrillQuestion {
  prompt: string;
  type: 'translate' | 'fill-blank' | 'multiple-choice';
  answer: string;
  options?: string[];
}

interface DrillSession {
  id: string;
  mode: string;
  questions: DrillQuestion[];
  responses: Array<{ questionIndex: number; userAnswer: string; correct: boolean }>;
  score: number;
  startedAt: string;
  completedAt?: string;
}

interface PracticeState {
  currentDrill: DrillSession | null;
  drillHistory: DrillSession[];
  isRecording: boolean;
  isLoading: boolean;

  startDrill: (mode: string) => Promise<void>;
  submitResponse: (questionIndex: number, userAnswer: string, correct: boolean) => void;
  endDrill: () => void;
  loadHistory: () => Promise<void>;
  setCurrentDrill: (drill: DrillSession | null) => void;
  setRecording: (recording: boolean) => void;
  addToHistory: (drill: DrillSession) => void;
  setHistory: (history: DrillSession[]) => void;
  setLoading: (loading: boolean) => void;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  currentDrill: null,
  drillHistory: [],
  isRecording: false,
  isLoading: false,

  startDrill: async (mode: string) => {
    set({ isLoading: true });
    // Placeholder: would fetch drill from API
    await new Promise((resolve) => setTimeout(resolve, 300));
    const drill: DrillSession = {
      id: `drill-${Date.now()}`,
      mode,
      questions: [],
      responses: [],
      score: 0,
      startedAt: new Date().toISOString(),
    };
    set({ currentDrill: drill, isLoading: false });
  },

  submitResponse: (questionIndex, userAnswer, correct) =>
    set((state) => {
      if (!state.currentDrill) return {};
      return {
        currentDrill: {
          ...state.currentDrill,
          responses: [
            ...state.currentDrill.responses,
            { questionIndex, userAnswer, correct },
          ],
          score: state.currentDrill.score + (correct ? 1 : 0),
        },
      };
    }),

  endDrill: () =>
    set((state) => {
      const drill = state.currentDrill;
      if (!drill) return {};
      const completed = {
        ...drill,
        completedAt: new Date().toISOString(),
      };
      return {
        currentDrill: null,
        drillHistory: [completed, ...state.drillHistory],
      };
    }),

  loadHistory: async () => {
    set({ isLoading: true });
    // Placeholder: would fetch history from API
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ isLoading: false });
  },

  setCurrentDrill: (currentDrill) => set({ currentDrill }),
  setRecording: (isRecording) => set({ isRecording }),
  addToHistory: (drill) =>
    set((state) => ({ drillHistory: [drill, ...state.drillHistory] })),
  setHistory: (drillHistory) => set({ drillHistory }),
  setLoading: (isLoading) => set({ isLoading }),
}));
