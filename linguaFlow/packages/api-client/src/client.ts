import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  getAccessToken?: () => string | null;
  onTokenExpired?: () => void;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: attach auth token
  client.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = config.getAccessToken?.();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  });

  // Response interceptor: handle 401
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        config.onTokenExpired?.();
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export type { AxiosInstance, AxiosRequestConfig };
