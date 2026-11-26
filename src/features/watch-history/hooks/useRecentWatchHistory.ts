import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getRecentWatchHistory } from '../api/watch-history-api';
import { recentWatchHistoryInfiniteQueryKey } from './watch-history-query-keys';

/** The server maximum: bulk histories have hundreds of rows to page and select. */
const HISTORY_SCREEN_PAGE_SIZE = 100;

export function useRecentWatchHistory(
  undated = false,
  pageSize = HISTORY_SCREEN_PAGE_SIZE,
) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: [...recentWatchHistoryInfiniteQueryKey(pageSize), { undated }],
    queryFn: ({ pageParam, signal }) =>
      getRecentWatchHistory(pageParam, pageSize, signal, undated),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
