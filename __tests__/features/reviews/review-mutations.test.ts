import {
  invalidateProfileStatistics,
  invalidateReviewQueries,
} from '@/features/reviews/hooks/useReviewMutations';
import { profileStatisticsQueryKey } from '@/features/profile/hooks/profile-query-keys';
import {
  movieMyReviewQueryKey,
  tvMyReviewQueryKey,
} from '@/features/reviews/hooks/review-query-keys';

describe('review cache invalidation', () => {
  const movieId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
  const tvShowId = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

  it('invalidates movie review queries', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateReviewQueries(queryClient, 'movie', movieId);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: movieMyReviewQueryKey(movieId),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['reviews', 'movie', movieId],
    });
  });

  it('invalidates tv review queries', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateReviewQueries(queryClient, 'tv', tvShowId);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: tvMyReviewQueryKey(tvShowId),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['reviews', 'tv', tvShowId],
    });
  });

  it('invalidates profile statistics', () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateProfileStatistics(queryClient);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: profileStatisticsQueryKey(),
    });
  });
});
