import { createLinguaFlowApi } from '@linguaflow/api-client';
import { useAuthStore } from '../stores/auth.store';

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.linguaflow.app';

export const api = createLinguaFlowApi({
  baseURL: API_BASE_URL,
  getAccessToken: () => useAuthStore.getState().tokens?.accessToken ?? null,
  onTokenExpired: () => {
    useAuthStore.getState().clearAuth();
  },
});
