import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getRecentWatchHistory } from '../api/watch-history-api';
import { recentWatchHistoryInfiniteQueryKey } from './watch-history-query-keys';
import { DEFAULT_WATCH_HISTORY_PAGE_SIZE } from '../types';

export function useRecentWatchHistory(pageSize = DEFAULT_WATCH_HISTORY_PAGE_SIZE) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: recentWatchHistoryInfiniteQueryKey(pageSize),
    queryFn: ({ pageParam, signal }) => getRecentWatchHistory(pageParam, pageSize, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
