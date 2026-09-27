import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { user, token, settings, isLoading, isInitialized, logout, setAuth, setUser, setSettings } = useAuthStore();

  return {
    user,
    token,
    settings,
    isLoading,
    isInitialized,
    isAuthenticated: !!token && !!user,
    logout,
    setAuth,
    setUser,
    setSettings,
  };
}
