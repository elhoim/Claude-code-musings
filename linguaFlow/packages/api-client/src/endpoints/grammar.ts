import type { AxiosInstance } from 'axios';
import type {
  GrammarGraph,
  GrammarNode,
  UserGrammarProgress,
  WhyExplanation,
  LanguageCode,
} from '@linguaflow/shared';

export function createGrammarEndpoints(client: AxiosInstance) {
  return {
    getGraph: async (lang: LanguageCode): Promise<GrammarGraph> => {
      const { data } = await client.get<GrammarGraph>(`/api/v1/grammar/${lang}/graph`);
      return data;
    },

    getNode: async (lang: LanguageCode, nodeId: string): Promise<GrammarNode> => {
      const { data } = await client.get<GrammarNode>(`/api/v1/grammar/${lang}/nodes/${nodeId}`);
      return data;
    },

    getProgress: async (lang: LanguageCode): Promise<UserGrammarProgress[]> => {
      const { data } = await client.get<UserGrammarProgress[]>(`/api/v1/grammar/${lang}/progress`);
      return data;
    },

    getWhyExplanation: async (
      lang: LanguageCode,
      nodeId: string,
      sentence?: string,
    ): Promise<WhyExplanation> => {
      const { data } = await client.post<WhyExplanation>(
        `/api/v1/grammar/${lang}/nodes/${nodeId}/why`,
        { sentence },
      );
      return data;
    },
  };
}
