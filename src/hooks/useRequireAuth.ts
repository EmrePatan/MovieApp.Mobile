import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/auth/useAuth';

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const requireAuth = useCallback(
    (onAuthenticated?: () => void): boolean => {
      if (!isAuthenticated) {
        router.push('/(auth)/login');
        return false;
      }

      onAuthenticated?.();
      return true;
    },
    [isAuthenticated, router],
  );

  return { isAuthenticated, requireAuth };
}
