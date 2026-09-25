import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (isApiError(error)) {
          if (
            error.kind === 'unauthorized' ||
            error.kind === 'forbidden' ||
            error.kind === 'not_found' ||
            error.kind === 'validation' ||
            error.kind === 'conflict' ||
            error.kind === 'cancelled'
          ) {
            return false;
          }
        }

        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
