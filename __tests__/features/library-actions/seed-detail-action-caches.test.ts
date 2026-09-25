import { QueryClient } from '@tanstack/react-query';
import { favoriteStatusQueryKey } from '@/features/favorites/hooks/favorite-query-keys';
import { seedDetailActionCachesFromLibraryActions } from '@/features/library-actions/utils/seed-detail-action-caches';
import type { LibraryActionStatusResponse } from '@/features/library-actions/types';

describe('seedDetailActionCachesFromLibraryActions', () => {
  const movieId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('maps movie batch response into favorite status cache', () => {
    const queryClient = new QueryClient();
    const fetchStartedAt = Date.now();
    const actions: LibraryActionStatusResponse = {
      mediaType: 'movie',
      contentId: movieId,
      isFavorited: true,
      isInWatchlist: false,
      watchlistIds: [],
      isFollowing: false,
      notifyNewSeasons: false,
      notifyNewEpisodes: false,
      baselineEstablished: false,
      isWatched: true,
      watchedAt: '2026-01-01T00:00:00Z',
    };

    seedDetailActionCachesFromLibraryActions(
      queryClient,
      'movie',
      movieId,
      actions,
      fetchStartedAt,
    );

    expect(queryClient.getQueryData(favoriteStatusQueryKey('movie', movieId))).toBe(true);
  });

  it('does not overwrite optimistic favorite updates made after the batch started', () => {
    const queryClient = new QueryClient();
    const fetchStartedAt = Date.now() - 1_000;
    queryClient.setQueryData(favoriteStatusQueryKey('movie', movieId), false);

    const actions: LibraryActionStatusResponse = {
      mediaType: 'movie',
      contentId: movieId,
      isFavorited: true,
      isInWatchlist: false,
      watchlistIds: [],
      isFollowing: false,
      notifyNewSeasons: false,
      notifyNewEpisodes: false,
      baselineEstablished: false,
      isWatched: false,
      watchedAt: null,
    };

    seedDetailActionCachesFromLibraryActions(
      queryClient,
      'movie',
      movieId,
      actions,
      fetchStartedAt,
    );

    expect(queryClient.getQueryData(favoriteStatusQueryKey('movie', movieId))).toBe(false);
  });
});
