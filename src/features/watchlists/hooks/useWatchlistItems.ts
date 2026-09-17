import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import type { WatchlistItemsQueryParams } from '../utils/watchlist-items-query';
import {
  toWatchlistItemsMediaTypeQuery,
  toWatchlistItemsSortQuery,
} from '../utils/watchlist-items-query';
import { getWatchlistItems } from '../api/watchlists-api';
import { watchlistItemsInfiniteQueryKey } from './watchlist-query-keys';
import { DEFAULT_WATCHLIST_PAGE_SIZE } from '../types';

export function useWatchlistItems(
  watchlistId: string | null,
  query: WatchlistItemsQueryParams,
) {
  const { isAuthenticated } = useAuth();
  const mediaType = toWatchlistItemsMediaTypeQuery(query.mediaType);
  const sort = toWatchlistItemsSortQuery(query.sort);

  return useInfiniteQuery({
    queryKey: watchlistItemsInfiniteQueryKey(
      watchlistId ?? '',
      DEFAULT_WATCHLIST_PAGE_SIZE,
      mediaType,
      sort,
    ),
    queryFn: ({ pageParam, signal }) =>
      getWatchlistItems(
        watchlistId!,
        pageParam,
        DEFAULT_WATCHLIST_PAGE_SIZE,
        query,
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: isAuthenticated && Boolean(watchlistId),
    staleTime: 30_000,
  });
}
