import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DetailActionBar } from '@/features/details/shared/components/DetailActionBar';
import { getLibraryActionStatus } from '@/features/library-actions/api/library-actions-api';
import { addMovieFavorite, getMovieFavoriteStatus } from '@/features/favorites/api/favorites-api';
import { getMovieFollowStatus } from '@/features/follows/api/movie-follow-api';
import { getMovieWatchStatus } from '@/features/watch-history/api/watch-history-api';
import { getWatchlistMembership } from '@/features/watchlists/api/watchlists-api';

jest.mock('@/features/follows/components/FollowButton', () => ({
  FollowButton: () => null,
}));

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

jest.mock('@/features/watchlists/api/watchlists-api', () => ({
  getWatchlistMembership: jest.fn(),
  getWatchlists: jest.fn(),
}));

jest.mock('@/features/watch-history/api/watch-history-api', () => ({
  getMovieWatchStatus: jest.fn(),
  getTvShowProgress: jest.fn(),
  getEpisodeWatchStatus: jest.fn(),
  markMovieWatched: jest.fn(),
  unmarkMovieWatched: jest.fn(),
}));

jest.mock('@/features/follows/api/movie-follow-api', () => ({
  getMovieFollowStatus: jest.fn(),
  createMovieFollow: jest.fn(),
  removeMovieFollow: jest.fn(),
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

jest.mock('@/features/recommendations/utils/invalidate-recommendation-queries', () => ({
  invalidateRecommendationQueries: jest.fn(),
}));

jest.mock('@/features/library/utils/invalidate-library-queries', () => ({
  invalidateLibraryQueries: jest.fn(),
}));

jest.mock('@/features/profile/utils/invalidate-profile-statistics', () => ({
  invalidateProfileStatistics: jest.fn(),
}));

const movieId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

const batchStatus = {
  mediaType: 'movie' as const,
  contentId: movieId,
  isFavorited: true,
  isInWatchlist: true,
  watchlistIds: ['watchlist-1'],
  isFollowing: true,
  notifyNewSeasons: false,
  notifyNewEpisodes: false,
  baselineEstablished: false,
  isWatched: true,
  watchedAt: '2026-01-01T00:00:00Z',
};

function renderActionBar() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });

  const view = render(
    <QueryClientProvider client={queryClient}>
      <DetailActionBar
        contentType="movie"
        contentId={movieId}
        showWatched
        showReleaseAlert
      />
    </QueryClientProvider>,
  );

  return { queryClient, unmount: view.unmount };
}

describe('detail action batch hydration', () => {
  let unmount: (() => void) | undefined;
  let queryClient: QueryClient | undefined;

  afterEach(() => {
    unmount?.();
    queryClient?.clear();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getMovieFavoriteStatus as jest.Mock).mockResolvedValue({ isFavorited: false });
    (getWatchlistMembership as jest.Mock).mockResolvedValue({ watchlistIds: [] });
    (getMovieWatchStatus as jest.Mock).mockResolvedValue({
      movieId,
      isWatched: false,
      watchedAt: null,
    });
    (getMovieFollowStatus as jest.Mock).mockResolvedValue({ isFollowing: false });
  });

  it('hydrates favorite, watchlist, watched, and notify icons from the batch response', async () => {
    (getLibraryActionStatus as jest.Mock).mockResolvedValue(batchStatus);

    ({ queryClient, unmount } = renderActionBar());

    await waitFor(() => {
      expect(screen.getByLabelText('Remove from favorites')).toBeTruthy();
      expect(screen.getByLabelText('In watchlist')).toBeTruthy();
      expect(screen.getByLabelText('Mark as unwatched')).toBeTruthy();
      expect(screen.getByLabelText('Release alert on')).toBeTruthy();
    });

    expect(getLibraryActionStatus).toHaveBeenCalledTimes(1);
    expect(getMovieFavoriteStatus).not.toHaveBeenCalled();
    expect(getWatchlistMembership).not.toHaveBeenCalled();
    expect(getMovieWatchStatus).not.toHaveBeenCalled();
    expect(getMovieFollowStatus).not.toHaveBeenCalled();
  });

  it('keeps an optimistic favorite toggle when the batch response arrives later', async () => {
    let resolveBatch: (value: typeof batchStatus) => void = () => undefined;
    (getLibraryActionStatus as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveBatch = resolve;
        }),
    );
    (addMovieFavorite as jest.Mock).mockImplementation(() => new Promise(() => undefined));

    ({ queryClient, unmount } = renderActionBar());

    fireEvent.press(screen.getByLabelText('Add to favorites'));

    await waitFor(() => {
      expect(screen.getByLabelText('Remove from favorites')).toBeTruthy();
    });

    await act(async () => {
      resolveBatch({
        ...batchStatus,
        isFavorited: false,
        isWatched: false,
        isFollowing: false,
        watchlistIds: [],
      });
    });

    await waitFor(() => {
      expect(getLibraryActionStatus).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByLabelText('Remove from favorites')).toBeTruthy();
    expect(getMovieFavoriteStatus).not.toHaveBeenCalled();
  });
});
