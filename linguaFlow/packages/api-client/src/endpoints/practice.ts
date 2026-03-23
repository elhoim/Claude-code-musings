import type { AxiosInstance } from 'axios';
import type { DrillSession, DrillFeedback, DrillMode, LanguageCode } from '@linguaflow/shared';

export function createPracticeEndpoints(client: AxiosInstance) {
  return {
    startDrill: async (input: {
      mode: DrillMode;
      language: LanguageCode;
      timeLimitSeconds?: number;
    }): Promise<DrillSession> => {
      const { data } = await client.post<DrillSession>('/api/v1/practice/drills', input);
      return data;
    },

    submitDrill: async (
      drillId: string,
      response: { audioUrl: string; transcription: string; durationSeconds: number },
    ): Promise<DrillSession> => {
      const { data } = await client.post<DrillSession>(
        `/api/v1/practice/drills/${drillId}/submit`,
        response,
      );
      return data;
    },

    getFeedback: async (drillId: string): Promise<DrillFeedback> => {
      const { data } = await client.get<DrillFeedback>(
        `/api/v1/practice/drills/${drillId}/feedback`,
      );
      return data;
    },

    getHistory: async (limit?: number): Promise<DrillSession[]> => {
      const { data } = await client.get<DrillSession[]>('/api/v1/practice/history', {
        params: { limit },
      });
      return data;
    },
  };
}
