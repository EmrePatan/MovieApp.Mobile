import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { addMovieFavorite } from '@/features/favorites/api/favorites-api';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { favoriteStatusQueryKey } from '@/features/favorites/hooks/favorite-query-keys';
import { createMovieFollow } from '@/features/follows/api/movie-follow-api';
import { MovieFollowButton } from '@/features/follows/components/MovieFollowButton';
import { movieFollowStatusQueryKey } from '@/features/follows/hooks/follow-query-keys';
import { markMovieWatched } from '@/features/watch-history/api/watch-history-api';
import { WatchedButton } from '@/features/watch-history/components/WatchedButton';
import { movieWatchStatusQueryKey } from '@/features/watch-history/hooks/watch-history-query-keys';

const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const mockRequireAuth = jest.fn(() => true);

jest.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({
    isAuthenticated: true,
    requireAuth: mockRequireAuth,
  }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 'user-id' },
    token: 'token',
  }),
}));

jest.mock('@/features/favorites/api/favorites-api', () => ({
  addMovieFavorite: jest.fn(),
  removeMovieFavorite: jest.fn(),
  addTvFavorite: jest.fn(),
  removeTvFavorite: jest.fn(),
  getMovieFavoriteStatus: jest.fn(),
  getTvFavoriteStatus: jest.fn(),
}));

jest.mock('@/features/watch-history/api/watch-history-api', () => ({
  markMovieWatched: jest.fn(),
  unmarkMovieWatched: jest.fn(),
  getMovieWatchStatus: jest.fn(),
  getTvShowProgress: jest.fn(),
  getEpisodeWatchStatus: jest.fn(),
  bulkUpdateTvShowWatchState: jest.fn(),
  markEpisodeWatched: jest.fn(),
  unmarkEpisodeWatched: jest.fn(),
}));

jest.mock('@/features/follows/api/movie-follow-api', () => ({
  createMovieFollow: jest.fn(),
  removeMovieFollow: jest.fn(),
  getMovieFollowStatus: jest.fn(),
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

jest.mock('@/features/follows/utils/invalidate-follow-catalog-queries', () => ({
  invalidateFollowCatalogQueries: jest.fn(),
}));

jest.mock('@/features/follows/utils/home-coming-up-cache', () => ({
  removeFollowedCatalogFromHomeCaches: jest.fn(),
}));

jest.mock('@/features/follows/services/push-device-service', () => ({
  ensurePushDeviceRegisteredAsync: jest.fn().mockResolvedValue('registered'),
}));

function renderWithQueryClient(ui: React.ReactElement, queryClient: QueryClient) {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

describe('detail action optimistic UX integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockReturnValue(true);
  });

  it('favorite updates icon immediately while mutation is pending', async () => {
    let resolveCreate!: () => void;
    (addMovieFavorite as jest.Mock).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveCreate = resolve;
        }),
    );

    const queryClient = createQueryClient();
    queryClient.setQueryData(favoriteStatusQueryKey('movie', movieId), false);

    renderWithQueryClient(
      <FavoriteButton contentType="movie" contentId={movieId} variant="detail" />,
      queryClient,
    );

    fireEvent.press(screen.getByLabelText('Add to favorites'));

    await waitFor(() => {
      expect(screen.getByLabelText('Remove from favorites')).toBeTruthy();
    });
    expect(screen.getByLabelText('Remove from favorites').props.accessibilityState.busy).toBe(
      true,
    );

    resolveCreate();
    await waitFor(() => expect(addMovieFavorite).toHaveBeenCalledWith(movieId));
  });

  it('favorite rolls back icon when mutation fails', async () => {
    (addMovieFavorite as jest.Mock).mockRejectedValue(new Error('Network error'));

    const queryClient = createQueryClient();
    queryClient.setQueryData(favoriteStatusQueryKey('movie', movieId), false);

    renderWithQueryClient(
      <FavoriteButton contentType="movie" contentId={movieId} variant="detail" />,
      queryClient,
    );

    fireEvent.press(screen.getByLabelText('Add to favorites'));

    await waitFor(() => {
      expect(screen.getByText('Could not update your favorite. Please try again.')).toBeTruthy();
    });
    expect(screen.getByLabelText('Add to favorites')).toBeTruthy();
  });

  it('watched updates icon immediately while mutation is pending', async () => {
    let resolveWatched!: () => void;
    (markMovieWatched as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveWatched = () =>
            resolve({
              movieId,
              watchedAt: new Date().toISOString(),
            });
        }),
    );

    const queryClient = createQueryClient();
    queryClient.setQueryData(movieWatchStatusQueryKey(movieId), {
      movieId,
      isWatched: false,
      watchedAt: null,
    });

    renderWithQueryClient(
      <WatchedButton target={{ type: 'movie', contentId: movieId }} variant="detail" />,
      queryClient,
    );

    fireEvent.press(screen.getByLabelText('Mark as watched'));

    await waitFor(() => {
      expect(screen.getByLabelText('Mark as unwatched')).toBeTruthy();
    });
    expect(screen.getByLabelText('Mark as unwatched').props.accessibilityState.busy).toBe(true);

    resolveWatched();
    await waitFor(() => expect(markMovieWatched).toHaveBeenCalledWith(movieId));
  });

  it('movie follow updates icon immediately while mutation is pending', async () => {
    let resolveFollow!: () => void;
    (createMovieFollow as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFollow = () => resolve({ isFollowing: true });
        }),
    );

    const queryClient = createQueryClient();
    queryClient.setQueryData(movieFollowStatusQueryKey(movieId), { isFollowing: false });

    renderWithQueryClient(<MovieFollowButton movieId={movieId} />, queryClient);

    fireEvent.press(screen.getByLabelText('Notify me when released'));

    await waitFor(() => {
      expect(screen.getByLabelText('Release alert on')).toBeTruthy();
    });
    expect(screen.getByLabelText('Release alert on').props.accessibilityState.busy).toBe(false);

    resolveFollow();
    await waitFor(() => expect(createMovieFollow).toHaveBeenCalledWith(movieId));
  });
});
