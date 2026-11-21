import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteEpisodeRating,
  deleteMovieRating,
  deleteTvRating,
  rateEpisode,
  rateMovie,
  rateTvShow,
} from '../api/ratings-api';
import {
  episodeMyRatingQueryKey,
  episodeRatingAggregateQueryKey,
  movieMyRatingQueryKey,
  movieRatingAggregateQueryKey,
  tvMyRatingQueryKey,
  tvRatingAggregateQueryKey,
} from './rating-query-keys';
import { invalidateProfileStatistics } from '@/features/profile/utils/invalidate-profile-statistics';
import { invalidateSocialActivityQueries } from '@/features/social/utils/invalidate-social-activity-queries';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import type { RatingContentType, RatingResponse } from '../types';

function getMyRatingQueryKey(contentType: RatingContentType, contentId: string) {
  switch (contentType) {
    case 'movie':
      return movieMyRatingQueryKey(contentId);
    case 'tv':
      return tvMyRatingQueryKey(contentId);
    case 'episode':
      return episodeMyRatingQueryKey(contentId);
  }
}

function invalidateAggregateQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contentType: RatingContentType,
  contentId: string,
) {
  switch (contentType) {
    case 'movie':
      void queryClient.invalidateQueries({ queryKey: movieRatingAggregateQueryKey(contentId) });
      break;
    case 'tv':
      void queryClient.invalidateQueries({ queryKey: tvRatingAggregateQueryKey(contentId) });
      break;
    case 'episode':
      void queryClient.invalidateQueries({ queryKey: episodeRatingAggregateQueryKey(contentId) });
      break;
  }

  invalidateRecommendationQueries(queryClient);
  invalidateProfileStatistics(queryClient);
  invalidateSocialActivityQueries(queryClient);
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
    episodeId: contentType === 'episode' ? contentId : null,
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
      switch (contentType) {
        case 'movie':
          return rateMovie(contentId, score);
        case 'tv':
          return rateTvShow(contentId, score);
        case 'episode':
          return rateEpisode(contentId, score);
      }
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
      trackProductMetric(PRODUCT_METRICS.ratingCreated);
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
      switch (contentType) {
        case 'movie':
          await deleteMovieRating(contentId);
          return;
        case 'tv':
          await deleteTvRating(contentId);
          return;
        case 'episode':
          await deleteEpisodeRating(contentId);
          return;
      }
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
