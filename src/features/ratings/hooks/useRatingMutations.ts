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
import type { RatingContentType, RatingResponse } from '../types';

function getMyRatingQueryKey(contentType: RatingContentType, contentId: string) {
  return contentType === 'movie'
    ? movieMyRatingQueryKey(contentId)
    : tvMyRatingQueryKey(contentId);
}

function invalidateAggregateQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contentType: RatingContentType,
  contentId: string,
) {
  if (contentType === 'movie') {
    void queryClient.invalidateQueries({ queryKey: movieRatingAggregateQueryKey(contentId) });
  } else {
    void queryClient.invalidateQueries({ queryKey: tvRatingAggregateQueryKey(contentId) });
  }

  invalidateRecommendationQueries(queryClient);
  invalidateProfileStatistics(queryClient);
}

function buildOptimisticRating(
  contentType: RatingContentType,
  contentId: string,
  score: number,
  previous: RatingResponse | null | undefined,
): RatingResponse {
  const now = new Date().toISOString();

  return {
    id: previous?.id ?? 'optimistic-rating',
    movieId: contentType === 'movie' ? contentId : null,
    tvShowId: contentType === 'tv' ? contentId : null,
    score,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
}

export function useRateContent(contentType: RatingContentType, contentId: string) {
  const queryClient = useQueryClient();
  const myRatingKey = getMyRatingQueryKey(contentType, contentId);

  return useMutation({
    mutationFn: async (score: number) => {
      if (contentType === 'movie') {
        return rateMovie(contentId, score);
      }

      return rateTvShow(contentId, score);
    },
    onMutate: async (score) => {
      await queryClient.cancelQueries({ queryKey: myRatingKey });
      const previous = queryClient.getQueryData<RatingResponse | null>(myRatingKey);
      queryClient.setQueryData(
        myRatingKey,
        buildOptimisticRating(contentType, contentId, score, previous),
      );

      return { previous };
    },
    onError: (_error, _score, context) => {
      if (context) {
        queryClient.setQueryData(myRatingKey, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(myRatingKey, data);
      invalidateAggregateQueries(queryClient, contentType, contentId);
    },
  });
}

export function useDeleteRating(contentType: RatingContentType, contentId: string) {
  const queryClient = useQueryClient();
  const myRatingKey = getMyRatingQueryKey(contentType, contentId);

  return useMutation({
    mutationFn: async () => {
      if (contentType === 'movie') {
        await deleteMovieRating(contentId);
        return;
      }

      await deleteTvRating(contentId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: myRatingKey });
      const previous = queryClient.getQueryData<RatingResponse | null>(myRatingKey);
      queryClient.setQueryData(myRatingKey, null);

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(myRatingKey, context.previous);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(myRatingKey, null);
      invalidateAggregateQueries(queryClient, contentType, contentId);
    },
  });
}
