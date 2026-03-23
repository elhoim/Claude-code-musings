import type { AxiosInstance } from 'axios';
import type { AuthTokens, CreateUserInput, LoginInput, User } from '@linguaflow/shared';

export function createAuthEndpoints(client: AxiosInstance) {
  return {
    register: async (input: CreateUserInput): Promise<AuthTokens> => {
      const { data } = await client.post<AuthTokens>('/api/v1/auth/register', input);
      return data;
    },

    login: async (input: LoginInput): Promise<AuthTokens> => {
      const { data } = await client.post<AuthTokens>('/api/v1/auth/login', input);
      return data;
    },

    refresh: async (refreshToken: string): Promise<AuthTokens> => {
      const { data } = await client.post<AuthTokens>('/api/v1/auth/refresh', { refreshToken });
      return data;
    },

    getMe: async (): Promise<User> => {
      const { data } = await client.get<User>('/api/v1/users/me');
      return data;
    },
  };
}
