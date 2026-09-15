import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getCatalogNextPageParam } from '@/models/api/catalog-pagination';
import { getNotificationsInbox } from '../api/notifications-api';
import { notificationsInboxInfiniteQueryKey } from './notification-query-keys';
import { DEFAULT_NOTIFICATIONS_PAGE_SIZE } from '../types';

export function useNotificationsInbox(pageSize = DEFAULT_NOTIFICATIONS_PAGE_SIZE) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: notificationsInboxInfiniteQueryKey(pageSize),
    queryFn: ({ pageParam, signal }) =>
      getNotificationsInbox({ page: pageParam, pageSize }, signal),
    initialPageParam: 1,
    getNextPageParam: getCatalogNextPageParam,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
