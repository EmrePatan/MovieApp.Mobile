import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { createWatchlist } from '@/features/watchlists/api/watchlists-api';
import { useCreateWatchlistForLibrary } from '@/features/watchlists/hooks/useWatchlistMutations';
import { createMovieReview } from '@/features/reviews/api/reviews-api';
import { useCreateReviewMutation } from '@/features/reviews/hooks/useReviewMutations';
import { rateMovie } from '@/features/ratings/api/ratings-api';
import { useRateContent } from '@/features/ratings/hooks/useRatingMutations';
import { trackProductMetric } from '@/features/metrics/track-product-metric';

jest.mock('@/features/watchlists/api/watchlists-api', () => ({
  createWatchlist: jest.fn(),
  addMovieToWatchlist: jest.fn(),
  addTvToWatchlist: jest.fn(),
  deleteWatchlist: jest.fn(),
  updateWatchlist: jest.fn(),
  removeMovieFromWatchlist: jest.fn(),
  removeTvFromWatchlist: jest.fn(),
}));

jest.mock('@/features/reviews/api/reviews-api', () => ({
  createMovieReview: jest.fn(),
  createTvReview: jest.fn(),
  updateMovieReview: jest.fn(),
  updateTvReview: jest.fn(),
  deleteMovieReview: jest.fn(),
  deleteTvReview: jest.fn(),
}));

jest.mock('@/features/ratings/api/ratings-api', () => ({
  rateMovie: jest.fn(),
  rateTvShow: jest.fn(),
  deleteMovieRating: jest.fn(),
  deleteTvRating: jest.fn(),
}));

jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
}));

jest.mock('@/features/library/utils/invalidate-library-queries', () => ({
  invalidateLibraryQueries: jest.fn(),
}));

jest.mock('@/features/profile/utils/invalidate-profile-statistics', () => ({
  invalidateProfileStatistics: jest.fn(),
}));

jest.mock('@/features/recommendations/utils/invalidate-recommendation-queries', () => ({
  invalidateRecommendationQueries: jest.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('product metric mutation hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks watchlist_created after successful watchlist creation', async () => {
    (createWatchlist as jest.Mock).mockResolvedValue({
      id: 'watchlist-1',
      name: 'Sci-Fi',
      itemCount: 0,
    });

    const { result } = renderHook(() => useCreateWatchlistForLibrary(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('Sci-Fi');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(trackProductMetric).toHaveBeenCalledWith('watchlist_created');
  });

  it('tracks review_created after successful review creation', async () => {
    (createMovieReview as jest.Mock).mockResolvedValue({
      id: 'review-1',
      body: 'Great film',
    });

    const { result } = renderHook(() => useCreateReviewMutation('movie', 'movie-1'), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ body: 'Great film' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(trackProductMetric).toHaveBeenCalledWith('review_created');
  });

  it('tracks rating_created after successful rating submission', async () => {
    (rateMovie as jest.Mock).mockResolvedValue({
      id: 'rating-1',
      movieId: 'movie-1',
      tvShowId: null,
      score: 8,
      createdAt: '2026-09-21T00:00:00.000Z',
      updatedAt: '2026-09-21T00:00:00.000Z',
    });

    const { result } = renderHook(() => useRateContent('movie', 'movie-1'), {
      wrapper: createWrapper(),
    });

    result.current.mutate(8);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(trackProductMetric).toHaveBeenCalledWith('rating_created');
  });
});
