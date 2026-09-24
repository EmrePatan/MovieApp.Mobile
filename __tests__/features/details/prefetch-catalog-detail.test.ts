import * as SecureStore from 'expo-secure-store';
import { QueryClient } from '@tanstack/react-query';
import { getMovieDetails } from '@/features/details/movie/api/movie-api';
import { movieQueryKey } from '@/features/details/movie/hooks/useMovieDetails';
import { getTvShowDetails } from '@/features/details/tv/api/tv-api';
import { tvShowQueryKey } from '@/features/details/tv/hooks/useTvShowDetails';
import { externalRatingsQueryKey } from '@/features/external-ratings/hooks/external-ratings-query-keys';
import { getExternalRatings } from '@/features/external-ratings/api/external-ratings-api';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { getMovieFavoriteStatus, getTvFavoriteStatus } from '@/features/favorites/api/favorites-api';
import { favoriteStatusQueryKey } from '@/features/favorites/hooks/favorite-query-keys';
import { getMovieFollowStatus } from '@/features/follows/api/movie-follow-api';
import { getTvShowFollowStatus } from '@/features/follows/api/follow-api';
import {
  movieFollowStatusQueryKey,
  tvShowFollowStatusQueryKey,
} from '@/features/follows/hooks/follow-query-keys';
import { getMovieWatchStatus, getTvShowProgress } from '@/features/watch-history/api/watch-history-api';
import {
  movieWatchStatusQueryKey,
  tvShowProgressQueryKey,
} from '@/features/watch-history/hooks/watch-history-query-keys';
import { getWatchlistMembership } from '@/features/watchlists/api/watchlists-api';
import { watchlistMembershipQueryKey } from '@/features/watchlists/hooks/watchlist-query-keys';

jest.mock('@/features/details/movie/api/movie-api', () => ({
  getMovieDetails: jest.fn(),
}));

jest.mock('@/features/details/tv/api/tv-api', () => ({
  getTvShowDetails: jest.fn(),
}));

jest.mock('@/features/favorites/api/favorites-api', () => ({
  getMovieFavoriteStatus: jest.fn(),
  getTvFavoriteStatus: jest.fn(),
}));

jest.mock('@/features/follows/api/movie-follow-api', () => ({
  getMovieFollowStatus: jest.fn(),
}));

jest.mock('@/features/follows/api/follow-api', () => ({
  getTvShowFollowStatus: jest.fn(),
}));

jest.mock('@/features/watch-history/api/watch-history-api', () => ({
  getMovieWatchStatus: jest.fn(),
  getTvShowProgress: jest.fn(),
}));

jest.mock('@/features/watchlists/api/watchlists-api', () => ({
  getWatchlistMembership: jest.fn(),
}));

jest.mock('@/features/external-ratings/api/external-ratings-api', () => ({
  getExternalRatings: jest.fn(),
}));

describe('prefetchCatalogDetail', () => {
  const movieId = '65de321a-597a-46ec-a499-67ad9e20795e';
  const tvShowId = 'a2f4b2f0-2f39-4a5a-9c0d-8d1f6e6b6f10';

  beforeEach(() => {
    jest.clearAllMocks();
    (getMovieDetails as jest.Mock).mockResolvedValue({ id: movieId, title: 'Matrix' });
    (getTvShowDetails as jest.Mock).mockResolvedValue({ id: tvShowId, title: 'Breaking Bad' });
    (getMovieFavoriteStatus as jest.Mock).mockResolvedValue({ isFavorited: true });
    (getTvFavoriteStatus as jest.Mock).mockResolvedValue({ isFavorited: false });
    (getWatchlistMembership as jest.Mock).mockResolvedValue({ watchlistIds: [] });
    (getMovieWatchStatus as jest.Mock).mockResolvedValue({ isWatched: false });
    (getTvShowProgress as jest.Mock).mockResolvedValue({ isFullyWatched: false });
    (getMovieFollowStatus as jest.Mock).mockResolvedValue({ isFollowing: false });
    (getTvShowFollowStatus as jest.Mock).mockResolvedValue({ isFollowing: false });
    (getExternalRatings as jest.Mock).mockResolvedValue({ ratings: [] });
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  });

  it('prefetches external ratings with the canonical query key', async () => {
    const queryClient = new QueryClient();
    const prefetchSpy = jest.spyOn(queryClient, 'prefetchQuery');

    prefetchCatalogDetail(queryClient, movieId, 'movie');

    expect(prefetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: externalRatingsQueryKey('movie', movieId),
      }),
    );
  });

  it('prefetches movie details for valid ids', async () => {
    const queryClient = new QueryClient();
    const prefetchSpy = jest.spyOn(queryClient, 'prefetchQuery');

    prefetchCatalogDetail(queryClient, movieId, 'movie');

    expect(prefetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: movieQueryKey(movieId),
        staleTime: 60_000,
      }),
    );

    await queryClient.fetchQuery({
      queryKey: movieQueryKey(movieId),
      queryFn: ({ signal }) => getMovieDetails(movieId, signal),
    });

    expect(getMovieDetails).toHaveBeenCalledWith(movieId, expect.any(AbortSignal));
  });

  it('skips prefetch for invalid ids', () => {
    const queryClient = new QueryClient();
    const prefetchSpy = jest.spyOn(queryClient, 'prefetchQuery');

    prefetchCatalogDetail(queryClient, 'not-a-guid', 'movie');

    expect(prefetchSpy).not.toHaveBeenCalled();
  });

  it('warms the movie detail action-bar status caches when authenticated', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('a-token');
    const queryClient = new QueryClient();

    prefetchCatalogDetail(queryClient, movieId, 'movie');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      queryClient.getQueryData(favoriteStatusQueryKey('movie', movieId)),
    ).toBe(true);
    expect(
      queryClient.getQueryData(watchlistMembershipQueryKey('movie', movieId)),
    ).toEqual({});
    expect(queryClient.getQueryData(movieWatchStatusQueryKey(movieId))).toEqual({
      isWatched: false,
    });
    expect(queryClient.getQueryData(movieFollowStatusQueryKey(movieId))).toEqual({
      isFollowing: false,
    });
  });

  it('warms the tv detail action-bar status caches when authenticated', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('a-token');
    const queryClient = new QueryClient();

    prefetchCatalogDetail(queryClient, tvShowId, 'tv');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      queryClient.getQueryData(favoriteStatusQueryKey('tv', tvShowId)),
    ).toBe(false);
    expect(
      queryClient.getQueryData(watchlistMembershipQueryKey('tv', tvShowId)),
    ).toEqual({});
    expect(queryClient.getQueryData(tvShowProgressQueryKey(tvShowId))).toEqual({
      isFullyWatched: false,
    });
    expect(queryClient.getQueryData(tvShowFollowStatusQueryKey(tvShowId))).toEqual({
      isFollowing: false,
    });
  });

  it('does not warm action-bar status caches when unauthenticated', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    const queryClient = new QueryClient();

    prefetchCatalogDetail(queryClient, movieId, 'movie');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getMovieFavoriteStatus).not.toHaveBeenCalled();
    expect(getWatchlistMembership).not.toHaveBeenCalled();
    expect(getMovieWatchStatus).not.toHaveBeenCalled();
    expect(getMovieFollowStatus).not.toHaveBeenCalled();
  });
});
