import { QueryClient } from '@tanstack/react-query';
import { favoritesInfiniteQueryKey } from '@/features/favorites/hooks/favorite-query-keys';
import { DEFAULT_FAVORITES_PAGE_SIZE } from '@/features/favorites/types';
import {
  removeFavoriteFromCache,
} from '@/features/library/utils/optimistic-favorites-cache';

describe('removeFavoriteFromCache', () => {
  it('removes a movie from the favorites infinite cache', () => {
    const queryClient = new QueryClient();
    const queryKey = favoritesInfiniteQueryKey(DEFAULT_FAVORITES_PAGE_SIZE);

    queryClient.setQueryData(queryKey, {
      pages: [
        {
          movies: [
            {
              id: 'movie-id',
              title: 'Inception',
              posterPath: null,
              releaseDate: '2010-07-16',
              voteAverage: 8.8,
            },
          ],
          tvShows: [],
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      ],
      pageParams: [1],
    });

    const previous = removeFavoriteFromCache(queryClient, 'movie', 'movie-id');
    const next = queryClient.getQueryData<typeof previous>(queryKey);

    expect(previous?.pages[0]?.movies).toHaveLength(1);
    expect(next?.pages[0]?.movies).toHaveLength(0);
    expect(next?.pages[0]?.totalCount).toBe(0);
  });

  it('restores previous cache on rollback', () => {
    const queryClient = new QueryClient();
    const queryKey = favoritesInfiniteQueryKey(DEFAULT_FAVORITES_PAGE_SIZE);
    const initial = {
      pages: [
        {
          movies: [
            {
              id: 'movie-id',
              title: 'Inception',
              posterPath: null,
              releaseDate: '2010-07-16',
              voteAverage: 8.8,
            },
          ],
          tvShows: [],
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      ],
      pageParams: [1],
    };

    queryClient.setQueryData(queryKey, initial);
    const previous = removeFavoriteFromCache(queryClient, 'movie', 'movie-id');
    queryClient.setQueryData(queryKey, previous);

    const restored = queryClient.getQueryData<typeof initial>(queryKey);
    expect(restored?.pages[0]?.movies).toHaveLength(1);
  });
});
