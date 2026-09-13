import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { FavoritesResponse } from '@/features/favorites/types';
import type { FavoriteContentType } from '@/features/favorites/types';
import { favoritesInfiniteQueryKey } from '@/features/favorites/hooks/favorite-query-keys';
import { DEFAULT_FAVORITES_PAGE_SIZE } from '@/features/favorites/types';

export function removeFavoriteFromCache(
  queryClient: QueryClient,
  contentType: FavoriteContentType,
  contentId: string,
): InfiniteData<FavoritesResponse> | undefined {
  const queryKey = favoritesInfiniteQueryKey(DEFAULT_FAVORITES_PAGE_SIZE);
  const previous = queryClient.getQueryData<InfiniteData<FavoritesResponse>>(queryKey);

  if (!previous) {
    return undefined;
  }

  queryClient.setQueryData<InfiniteData<FavoritesResponse>>(queryKey, {
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
