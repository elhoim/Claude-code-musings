import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  displayName: string;
  nativeLanguage: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    nativeLanguage: string,
  ) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setAuth: (user: User, tokens: AuthTokens) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    // Placeholder: simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user: User = {
      id: 'user-1',
      email,
      displayName: email.split('@')[0],
      nativeLanguage: 'en',
    };
    const tokens: AuthTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
    set({ user, tokens, isAuthenticated: true, isLoading: false });
  },

  register: async (
    email: string,
    password: string,
    displayName: string,
    nativeLanguage: string,
  ) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const user: User = {
      id: 'user-1',
      email,
      displayName,
      nativeLanguage,
    };
    const tokens: AuthTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
    set({ user, tokens, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    set({ user: null, tokens: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    const currentTokens = get().tokens;
    if (!currentTokens) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({
      tokens: {
        accessToken: 'refreshed-access-token',
        refreshToken: currentTokens.refreshToken,
      },
    });
  },

  setAuth: (user, tokens) =>
    set({ user, tokens, isAuthenticated: true }),

  clearAuth: () =>
    set({ user: null, tokens: null, isAuthenticated: false }),

  setLoading: (isLoading) => set({ isLoading }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
