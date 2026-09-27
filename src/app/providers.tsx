import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { AuthModal } from '@/features/auth/AuthModal';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
        <AuthModal />
      </AuthInitializer>
    </QueryClientProvider>
  );
};
