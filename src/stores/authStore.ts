import { create } from 'zustand';
import { User, UserSettings } from '@/types/user';
import { getStoredToken, removeStoredToken, setStoredToken } from '@/lib/storage/token';
import { authApi } from '@/lib/api/auth';
import { onUnauthorized } from '@/lib/api/client';
import { queryClient } from '@/lib/query/queryClient';

interface AuthState {
  token: string | null;
  user: User | null;
  settings: UserSettings | null;
  isLoading: boolean;
  isInitialized: boolean;

  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setSettings: (settings: UserSettings) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  onUnauthorized(() => {
    set({ token: null, user: null, settings: null });
    queryClient.removeQueries({ queryKey: ['me'] });
    queryClient.removeQueries({ queryKey: ['favorites'] });
    queryClient.removeQueries({ queryKey: ['watchHistory'] });
  });

  return {
    token: getStoredToken(),
    user: null,
    settings: null,
    isLoading: true,
    isInitialized: false,

    setAuth: (token: string, user: User) => {
      setStoredToken(token);
      set({ token, user, isLoading: false });
    },

    setUser: (user: User) => {
      set({ user });
    },

    setSettings: (settings: UserSettings) => {
      set({ settings });
      if (settings.theme) {
        applyTheme(settings.theme);
      }
    },

    logout: async () => {
      try {
        const { token } = get();
        if (token) {
          await authApi.logout().catch(() => {});
        }
      } finally {
        removeStoredToken();
        set({ token: null, user: null, settings: null, isLoading: false });
        queryClient.clear();
      }
    },

    initializeAuth: async () => {
      const token = getStoredToken();
      if (!token) {
        set({ token: null, user: null, settings: null, isLoading: false, isInitialized: true });
        return;
      }

      set({ isLoading: true });
      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          set({
            token,
            user: response.data.user,
            settings: response.data.settings,
            isLoading: false,
            isInitialized: true,
          });
          if (response.data.settings?.theme) {
            applyTheme(response.data.settings.theme);
          }
        } else {
          removeStoredToken();
          set({ token: null, user: null, settings: null, isLoading: false, isInitialized: true });
        }
      } catch {
        removeStoredToken();
        set({ token: null, user: null, settings: null, isLoading: false, isInitialized: true });
      }
    },
  };
});

function applyTheme(theme: 'system' | 'light' | 'dark') {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
