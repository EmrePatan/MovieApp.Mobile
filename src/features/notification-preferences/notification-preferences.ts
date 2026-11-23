import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export interface NotificationPreferences {
  messagePushEnabled: boolean;
  releasePushEnabled: boolean;
}

const PATH = '/api/notification-preferences';
const QUERY_KEY = ['notification-preferences'] as const;

export function useNotificationPreferences() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: ({ signal }) => api.get<NotificationPreferences>(PATH, { signal }),
    staleTime: 30_000,
  });
}

/** Optimistic: the switch flips at once and rolls back if the server refuses. */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (next: NotificationPreferences) => api.put<NotificationPreferences>(PATH, next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationPreferences>(QUERY_KEY);
      queryClient.setQueryData(QUERY_KEY, next);
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
