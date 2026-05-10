import type { AxiosInstance } from 'axios';
import { createApiClient } from './client';
import type { ApiClientConfig } from './client';
import { createAuthEndpoints } from './endpoints/auth';
import { createLessonEndpoints } from './endpoints/lessons';
import { createSrsEndpoints } from './endpoints/srs';
import { createGrammarEndpoints } from './endpoints/grammar';
import { createStoryEndpoints } from './endpoints/stories';
import { createPracticeEndpoints } from './endpoints/practice';

export interface LinguaFlowApi {
  auth: ReturnType<typeof createAuthEndpoints>;
  lessons: ReturnType<typeof createLessonEndpoints>;
  srs: ReturnType<typeof createSrsEndpoints>;
  grammar: ReturnType<typeof createGrammarEndpoints>;
  stories: ReturnType<typeof createStoryEndpoints>;
  practice: ReturnType<typeof createPracticeEndpoints>;
  client: AxiosInstance;
}

export function createLinguaFlowApi(config: ApiClientConfig): LinguaFlowApi {
  const client = createApiClient(config);

  return {
    auth: createAuthEndpoints(client),
    lessons: createLessonEndpoints(client),
    srs: createSrsEndpoints(client),
    grammar: createGrammarEndpoints(client),
    stories: createStoryEndpoints(client),
    practice: createPracticeEndpoints(client),
    client,
  };
}

export { createApiClient } from './client';
export type { ApiClientConfig } from './client';
