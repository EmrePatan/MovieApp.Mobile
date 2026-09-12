import { getFavorites } from '../api/favorites-api';
import type { FavoriteContentType } from '../types';

export function favoritesListQueryKey(page = 1, pageSize = 50) {
  return ['favorites', page, pageSize] as const;
}

export function favoritesInfiniteQueryKey(pageSize = 20) {
  return ['favorites', pageSize] as const;
}

export function favoriteStatusQueryKey(contentType: FavoriteContentType, contentId: string) {
  return ['favorite', contentType, contentId] as const;
}

export async function resolveFavoriteStatus(
  contentType: FavoriteContentType,
  contentId: string,
  signal?: AbortSignal,
): Promise<boolean> {
  let page = 1;
  const pageSize = 50;

  while (true) {
    const response = await getFavorites(page, pageSize, signal);
    const isFavorited =
      contentType === 'movie'
        ? response.movies.some((item) => item.id === contentId)
        : response.tvShows.some((item) => item.id === contentId);

    if (isFavorited) {
      return true;
    }

    if (!response.hasNextPage) {
      return false;
    }

    page += 1;
  }
}
