import type { AxiosInstance } from 'axios';
import type {
  LearningPath,
  Lesson,
  PlacementTestQuestion,
  PlacementTestResult,
  UserLessonProgress,
  LanguageCode,
} from '@linguaflow/shared';

export function createLessonEndpoints(client: AxiosInstance) {
  return {
    getPlacementTest: async (lang: LanguageCode): Promise<PlacementTestQuestion[]> => {
      const { data } = await client.get<PlacementTestQuestion[]>(`/api/v1/lessons/placement/${lang}`);
      return data;
    },

    submitPlacement: async (
      lang: LanguageCode,
      answers: { questionId: string; answer: string }[],
    ): Promise<PlacementTestResult> => {
      const { data } = await client.post<PlacementTestResult>(
        `/api/v1/lessons/placement/${lang}`,
        { answers },
      );
      return data;
    },

    getLearningPath: async (lang: LanguageCode): Promise<LearningPath> => {
      const { data } = await client.get<LearningPath>(`/api/v1/lessons/path/${lang}`);
      return data;
    },

    getLesson: async (id: string): Promise<Lesson> => {
      const { data } = await client.get<Lesson>(`/api/v1/lessons/${id}`);
      return data;
    },

    completeLesson: async (
      id: string,
      result: { score: number; exerciseResults: { exerciseId: string; correct: boolean; userAnswer: string; timeMs: number }[] },
    ): Promise<UserLessonProgress> => {
      const { data } = await client.post<UserLessonProgress>(`/api/v1/lessons/${id}/complete`, result);
      return data;
    },

    getProgress: async (lang: LanguageCode): Promise<UserLessonProgress[]> => {
      const { data } = await client.get<UserLessonProgress[]>(`/api/v1/lessons/progress/${lang}`);
      return data;
    },
  };
}
