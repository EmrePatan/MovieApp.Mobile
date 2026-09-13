import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteMovieRating,
  deleteTvRating,
  rateMovie,
  rateTvShow,
} from '../api/ratings-api';
import {
  movieMyRatingQueryKey,
  movieRatingAggregateQueryKey,
  tvMyRatingQueryKey,
  tvRatingAggregateQueryKey,
} from './rating-query-keys';
import { invalidateProfileStatistics } from '@/features/profile/utils/invalidate-profile-statistics';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import type { RatingContentType } from '../types';

function invalidateRatingQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contentType: RatingContentType,
  contentId: string,
) {
  if (contentType === 'movie') {
    void queryClient.invalidateQueries({ queryKey: movieMyRatingQueryKey(contentId) });
    void queryClient.invalidateQueries({ queryKey: movieRatingAggregateQueryKey(contentId) });
  } else {
    void queryClient.invalidateQueries({ queryKey: tvMyRatingQueryKey(contentId) });
    void queryClient.invalidateQueries({ queryKey: tvRatingAggregateQueryKey(contentId) });
  }

  invalidateRecommendationQueries(queryClient);
  invalidateProfileStatistics(queryClient);
}

export function useRateContent(contentType: RatingContentType, contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (score: number) => {
      if (contentType === 'movie') {
        return rateMovie(contentId, score);
      }

      return rateTvShow(contentId, score);
    },
    onSuccess: () => {
      invalidateRatingQueries(queryClient, contentType, contentId);
    },
  });
}

export function useDeleteRating(contentType: RatingContentType, contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (contentType === 'movie') {
        await deleteMovieRating(contentId);
        return;
      }

      await deleteTvRating(contentId);
    },
    onSuccess: () => {
      invalidateRatingQueries(queryClient, contentType, contentId);
    },
  });
}
