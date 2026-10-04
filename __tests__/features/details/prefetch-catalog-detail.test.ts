import { QueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { getMovieDetails } from '@/features/details/movie/api/movie-api';
import { movieQueryKey } from '@/features/details/movie/hooks/useMovieDetails';
import { getTvShowDetails } from '@/features/details/tv/api/tv-api';
import { externalRatingsQueryKey } from '@/features/external-ratings/hooks/external-ratings-query-keys';
import { getExternalRatings } from '@/features/external-ratings/api/external-ratings-api';
import { prefetchCatalogDetail } from '@/features/details/shared/navigation/prefetch-catalog-detail';
import { getLibraryActionStatus } from '@/features/library-actions/api/library-actions-api';
import { favoriteStatusQueryKey } from '@/features/favorites/hooks/favorite-query-keys';
import {
  movieFollowStatusQueryKey,
  tvShowFollowStatusQueryKey,
} from '@/features/follows/hooks/follow-query-keys';
import { getTvShowProgress } from '@/features/watch-history/api/watch-history-api';
import {
  movieWatchStatusQueryKey,
  tvShowProgressQueryKey,
} from '@/features/watch-history/hooks/watch-history-query-keys';
import { watchlistMembershipQueryKey } from '@/features/watchlists/hooks/watchlist-query-keys';
import type { LibraryActionStatusResponse } from '@/features/library-actions/types';

jest.mock('@/features/details/movie/api/movie-api', () => ({
  getMovieDetails: jest.fn(),
}));

jest.mock('@/features/details/tv/api/tv-api', () => ({
  getTvShowDetails: jest.fn(),
}));

jest.mock('@/features/library-actions/api/library-actions-api', () => ({
  getLibraryActionStatus: jest.fn(),
}));

jest.mock('@/features/watch-history/api/watch-history-api', () => ({
  getTvShowProgress: jest.fn(),
}));

jest.mock('@/features/external-ratings/api/external-ratings-api', () => ({
  getExternalRatings: jest.fn(),
}));

const movieActions: LibraryActionStatusResponse = {
  mediaType: 'movie',
  contentId: '65de321a-597a-46ec-a499-67ad9e20795e',
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

const tvActions: LibraryActionStatusResponse = {
  mediaType: 'tv',
  contentId: 'a2f4b2f0-2f39-4a5a-9c0d-8d1f6e6b6f10',
  isFavorited: false,
  isInWatchlist: false,
  watchlistIds: [],
  isFollowing: false,
  notifyNewSeasons: false,
  notifyNewEpisodes: false,
  baselineEstablished: false,
  isWatched: null,
  watchedAt: null,
};

describe('prefetchCatalogDetail', () => {
  const movieId = movieActions.contentId;
  const tvShowId = tvActions.contentId;

  beforeEach(() => {
    jest.clearAllMocks();
    (getMovieDetails as jest.Mock).mockResolvedValue({ id: movieId, title: 'Matrix' });
    (getTvShowDetails as jest.Mock).mockResolvedValue({ id: tvShowId, title: 'Breaking Bad' });
    (getLibraryActionStatus as jest.Mock).mockImplementation(
      async (mediaType: 'movie' | 'tv', contentId: string) =>
        mediaType === 'movie' && contentId === movieId
          ? movieActions
          : tvActions,
    );
    (getTvShowProgress as jest.Mock).mockResolvedValue({ isFullyWatched: false });
    (getExternalRatings as jest.Mock).mockResolvedValue({ ratings: [] });
    api.setTokenGetter(() => null);
    api.setAcceptLanguageGetter(() => 'en-US');
  });

  afterEach(() => {
    api.setTokenGetter(() => null);
    api.setAcceptLanguageGetter(() => 'en-US');
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
        queryKey: movieQueryKey(movieId, 'en-US'),
        staleTime: 60_000,
      }),
    );

    await queryClient.fetchQuery({
      queryKey: movieQueryKey(movieId, 'en-US'),
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
    api.setTokenGetter(() => 'a-token');
    const queryClient = new QueryClient();

    prefetchCatalogDetail(queryClient, movieId, 'movie');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getLibraryActionStatus).toHaveBeenCalledWith('movie', movieId, expect.any(AbortSignal));
    expect(
      queryClient.getQueryData(favoriteStatusQueryKey('movie', movieId)),
    ).toBe(true);
    expect(
      queryClient.getQueryData(watchlistMembershipQueryKey('movie', movieId)),
    ).toEqual({});
    expect(queryClient.getQueryData(movieWatchStatusQueryKey(movieId))).toEqual({
      movieId,
      isWatched: false,
      watchedAt: null,
    });
    expect(queryClient.getQueryData(movieFollowStatusQueryKey(movieId))).toEqual({
      isFollowing: false,
    });
  });

  it('warms the tv detail action-bar status caches when authenticated', async () => {
    api.setTokenGetter(() => 'a-token');
    const queryClient = new QueryClient();

    prefetchCatalogDetail(queryClient, tvShowId, 'tv');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getLibraryActionStatus).toHaveBeenCalledWith('tv', tvShowId, expect.any(AbortSignal));
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
      notifyNewSeasons: false,
      notifyNewEpisodes: false,
      baselineEstablished: false,
    });
  });

  it('does not warm action-bar status caches when unauthenticated', async () => {
    api.setTokenGetter(() => null);
    const queryClient = new QueryClient();

    prefetchCatalogDetail(queryClient, movieId, 'movie');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getLibraryActionStatus).not.toHaveBeenCalled();
  });
});
