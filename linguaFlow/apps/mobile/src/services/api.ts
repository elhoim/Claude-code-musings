import { useAuthStore } from '../stores/auth.store';

// Placeholder API configuration
// In production, this would use createLinguaFlowApi from @linguaflow/api-client

const API_BASE_URL = typeof __DEV__ !== 'undefined' && __DEV__
  ? 'http://localhost:3000'
  : 'https://api.linguaflow.app';

interface LinguaFlowApiConfig {
  baseURL: string;
  getAccessToken: () => string | null;
  onTokenExpired: () => void;
}

function createLinguaFlowApi(config: LinguaFlowApiConfig) {
  return {
    baseURL: config.baseURL,
    getAccessToken: config.getAccessToken,
    onTokenExpired: config.onTokenExpired,
  };
}

export const api = createLinguaFlowApi({
  baseURL: API_BASE_URL,
  getAccessToken: () => useAuthStore.getState().tokens?.accessToken ?? null,
  onTokenExpired: () => {
    useAuthStore.getState().clearAuth();
  },
});
