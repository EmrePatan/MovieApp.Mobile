import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getUnreadNotificationCount } from '../api/notifications-api';
import { unreadNotificationCountQueryKey } from './notification-query-keys';

export function useUnreadNotificationCount() {
  const { isAuthenticated, isSessionRestored } = useAuth();

  return useQuery({
    queryKey: unreadNotificationCountQueryKey(),
    queryFn: ({ signal }) => getUnreadNotificationCount(signal),
    enabled: isSessionRestored && isAuthenticated,
    staleTime: 30_000,
  });
}
