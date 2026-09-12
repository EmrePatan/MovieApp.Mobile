import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getWatchlistItems } from '../api/watchlists-api';
import { watchlistItemsInfiniteQueryKey } from './watchlist-query-keys';
import { DEFAULT_WATCHLIST_PAGE_SIZE } from '../types';

export function useWatchlistItems(watchlistId: string | null) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: watchlistItemsInfiniteQueryKey(watchlistId ?? '', DEFAULT_WATCHLIST_PAGE_SIZE),
    queryFn: ({ pageParam, signal }) =>
      getWatchlistItems(watchlistId!, pageParam, DEFAULT_WATCHLIST_PAGE_SIZE, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated && Boolean(watchlistId),
    staleTime: 30_000,
  });
}
