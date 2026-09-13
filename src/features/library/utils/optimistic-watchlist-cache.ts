import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { WatchlistContentType, WatchlistItemsResponse } from '@/features/watchlists/types';
import { watchlistItemsInfiniteQueryKey } from '@/features/watchlists/hooks/watchlist-query-keys';
import { DEFAULT_WATCHLIST_PAGE_SIZE } from '@/features/watchlists/types';

export function removeWatchlistItemFromCache(
  queryClient: QueryClient,
  watchlistId: string,
  contentType: WatchlistContentType,
  contentId: string,
): InfiniteData<WatchlistItemsResponse> | undefined {
  const queryKey = watchlistItemsInfiniteQueryKey(watchlistId, DEFAULT_WATCHLIST_PAGE_SIZE);
  const previous = queryClient.getQueryData<InfiniteData<WatchlistItemsResponse>>(queryKey);

  if (!previous) {
    return undefined;
  }

  queryClient.setQueryData<InfiniteData<WatchlistItemsResponse>>(queryKey, {
    ...previous,
    pages: previous.pages.map((page) => ({
      ...page,
      movies:
        contentType === 'movie'
          ? page.movies.filter((item) => item.id !== contentId)
          : page.movies,
      tvShows:
        contentType === 'tv'
          ? page.tvShows.filter((item) => item.id !== contentId)
          : page.tvShows,
      totalCount: Math.max(0, page.totalCount - 1),
    })),
  });

  return previous;
}
