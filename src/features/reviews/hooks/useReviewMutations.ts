import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createEpisodeReview,
  createMovieReview,
  createTvReview,
  deleteEpisodeReview,
  deleteMovieReview,
  deleteTvReview,
  updateEpisodeReview,
  updateMovieReview,
  updateTvReview,
} from '../api/reviews-api';
import { invalidateProfileStatistics } from '@/features/profile/utils/invalidate-profile-statistics';
import { invalidateSocialActivityQueries } from '@/features/social/utils/invalidate-social-activity-queries';
import {
  episodeMyReviewQueryKey,
  movieMyReviewQueryKey,
  tvMyReviewQueryKey,
} from './review-query-keys';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import type {
  CreateReviewRequest,
  ReviewContentType,
  ReviewListResponse,
  UpdateReviewRequest,
} from '../types';

export function invalidateReviewQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contentType: ReviewContentType,
  contentId: string,
) {
  invalidateSocialActivityQueries(queryClient);
  switch (contentType) {
    case 'movie':
      void queryClient.invalidateQueries({ queryKey: movieMyReviewQueryKey(contentId) });
      void queryClient.invalidateQueries({ queryKey: ['reviews', 'movie', contentId] });
      return;
    case 'tv':
      void queryClient.invalidateQueries({ queryKey: tvMyReviewQueryKey(contentId) });
      void queryClient.invalidateQueries({ queryKey: ['reviews', 'tv', contentId] });
      return;
    case 'episode':
      void queryClient.invalidateQueries({ queryKey: episodeMyReviewQueryKey(contentId) });
      void queryClient.invalidateQueries({ queryKey: ['reviews', 'episode', contentId] });
      return;
  }
}

export function useCreateReviewMutation(contentType: ReviewContentType, contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewRequest) => {
      switch (contentType) {
        case 'movie':
          return createMovieReview(contentId, payload);
        case 'tv':
          return createTvReview(contentId, payload);
        case 'episode':
          return createEpisodeReview(contentId, payload);
      }
    },
    onSuccess: () => {
      trackProductMetric(PRODUCT_METRICS.reviewCreated);
      invalidateReviewQueries(queryClient, contentType, contentId);
      invalidateProfileStatistics(queryClient);
      invalidateRecommendationQueries(queryClient);
    },
  });
}

export function useUpdateReviewMutation(contentType: ReviewContentType, contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateReviewRequest) => {
      switch (contentType) {
        case 'movie':
          return updateMovieReview(contentId, payload);
        case 'tv':
          return updateTvReview(contentId, payload);
        case 'episode':
          return updateEpisodeReview(contentId, payload);
      }
    },
    onSuccess: () => {
      invalidateReviewQueries(queryClient, contentType, contentId);
    },
  });
}

export function useDeleteReviewMutation(contentType: ReviewContentType, contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      switch (contentType) {
        case 'movie':
          return deleteMovieReview(contentId);
        case 'tv':
          return deleteTvReview(contentId);
        case 'episode':
          return deleteEpisodeReview(contentId);
      }
    },
    onSuccess: () => {
      const myReviewKey =
        contentType === 'movie'
          ? movieMyReviewQueryKey(contentId)
          : contentType === 'tv'
            ? tvMyReviewQueryKey(contentId)
            : episodeMyReviewQueryKey(contentId);
      queryClient.setQueryData(myReviewKey, null);

      queryClient.setQueriesData<ReviewListResponse>(
        { queryKey: ['reviews', contentType, contentId] },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            totalCount: Math.max(0, current.totalCount - 1),
          };
        },
      );

      invalidateReviewQueries(queryClient, contentType, contentId);
      invalidateProfileStatistics(queryClient);
      invalidateRecommendationQueries(queryClient);
    },
  });
}
