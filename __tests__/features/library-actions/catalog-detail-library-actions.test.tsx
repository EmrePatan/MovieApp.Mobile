import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DetailActionBar } from '@/features/details/shared/components/DetailActionBar';
import { getLibraryActionStatus } from '@/features/library-actions/api/library-actions-api';
import { getMovieFavoriteStatus } from '@/features/favorites/api/favorites-api';
import { favoriteStatusQueryKey } from '@/features/favorites/hooks/favorite-query-keys';

jest.mock('@/features/library-actions/api/library-actions-api', () => ({
  getLibraryActionStatus: jest.fn(),
}));

jest.mock('@/features/favorites/api/favorites-api', () => ({
  getMovieFavoriteStatus: jest.fn(),
  getTvFavoriteStatus: jest.fn(),
  addMovieFavorite: jest.fn(),
  removeMovieFavorite: jest.fn(),
  addTvFavorite: jest.fn(),
  removeTvFavorite: jest.fn(),
}));

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: () => true,
  }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

jest.mock('@/features/favorites/hooks/useFavoriteMutations', () => ({
  useToggleFavorite: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/features/watchlists/hooks/useWatchlists', () => ({
  useWatchlistMembership: () => ({ data: {}, isLoading: false }),
}));

jest.mock('@/features/watch-history/hooks/useMovieWatchStatus', () => ({
  useMovieWatchStatus: () => ({ data: { isWatched: false }, isLoading: false }),
}));

jest.mock('@/features/watch-history/hooks/useTvShowProgress', () => ({
  useTvShowProgress: () => ({ data: undefined, isLoading: false }),
}));

jest.mock('@/features/watch-history/hooks/useEpisodeWatchStatus', () => ({
  useEpisodeWatchStatus: () => ({ data: undefined, isLoading: false }),
}));

jest.mock('@/features/watch-history/hooks/useWatchHistoryMutations', () => ({
  useToggleMovieWatched: () => ({ mutate: jest.fn(), isPending: false }),
  useToggleTvShowWatched: () => ({ mutate: jest.fn(), isPending: false }),
  useToggleEpisodeWatched: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/features/follows/components/FollowButton', () => {
  const { Text } = require('react-native');
  return { FollowButton: () => <Text>Follow</Text> };
});

jest.mock('@/features/follows/components/MovieFollowButton', () => {
  const { Text } = require('react-native');
  return { MovieFollowButton: () => <Text>MovieFollow</Text> };
});

jest.mock('@/features/watchlists/components/WatchlistPickerModal', () => ({
  WatchlistPickerModal: () => null,
}));

const movieId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

describe('DetailActionBar library actions integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getLibraryActionStatus as jest.Mock).mockResolvedValue({
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
    });
  });

  it('loads initial action state from GET /api/library/actions once', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DetailActionBar contentType="movie" contentId={movieId} showWatched showReleaseAlert />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(getLibraryActionStatus).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(favoriteStatusQueryKey('movie', movieId))).toBe(true);
      expect(screen.getByLabelText('Remove from favorites')).toBeTruthy();
    });

    expect(getLibraryActionStatus).toHaveBeenCalledWith('movie', movieId, expect.any(AbortSignal));
    expect(getMovieFavoriteStatus).not.toHaveBeenCalled();
  });
});
