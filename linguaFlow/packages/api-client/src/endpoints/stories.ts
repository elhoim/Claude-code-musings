import type { AxiosInstance } from 'axios';
import type { Story, StorySegment, UserStoryState, LanguageCode } from '@linguaflow/shared';

export function createStoryEndpoints(client: AxiosInstance) {
  return {
    getStories: async (lang: LanguageCode): Promise<Story[]> => {
      const { data } = await client.get<Story[]>(`/api/v1/stories/${lang}`);
      return data;
    },

    getStory: async (id: string): Promise<Story & { segments: StorySegment[] }> => {
      const { data } = await client.get<Story & { segments: StorySegment[] }>(`/api/v1/stories/${id}`);
      return data;
    },

    makeChoice: async (storyId: string, choiceId: string): Promise<StorySegment> => {
      const { data } = await client.post<StorySegment>(`/api/v1/stories/${storyId}/choice`, {
        choiceId,
      });
      return data;
    },

    getState: async (storyId: string): Promise<UserStoryState> => {
      const { data } = await client.get<UserStoryState>(`/api/v1/stories/${storyId}/state`);
      return data;
    },
  };
}
