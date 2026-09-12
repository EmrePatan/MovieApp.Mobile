import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMovieReview,
  createTvReview,
  deleteMovieReview,
  deleteTvReview,
  updateMovieReview,
  updateTvReview,
} from '../api/reviews-api';
import { profileStatisticsQueryKey } from '@/features/profile/hooks/profile-query-keys';
import {
  movieMyReviewQueryKey,
  tvMyReviewQueryKey,
} from './review-query-keys';
import { invalidateRecommendationQueries } from '@/features/recommendations/utils/invalidate-recommendation-queries';
import type { CreateReviewRequest, ReviewContentType, UpdateReviewRequest } from '../types';

export function invalidateReviewQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  contentType: ReviewContentType,
  contentId: string,
) {
  if (contentType === 'movie') {
    void queryClient.invalidateQueries({ queryKey: movieMyReviewQueryKey(contentId) });
    void queryClient.invalidateQueries({ queryKey: ['reviews', 'movie', contentId] });
    return;
  }

  void queryClient.invalidateQueries({ queryKey: tvMyReviewQueryKey(contentId) });
  void queryClient.invalidateQueries({ queryKey: ['reviews', 'tv', contentId] });
}

export function invalidateProfileStatistics(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: profileStatisticsQueryKey() });
}

export function useCreateReviewMutation(contentType: ReviewContentType, contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewRequest) =>
      contentType === 'movie'
        ? createMovieReview(contentId, payload)
        : createTvReview(contentId, payload),
    onSuccess: () => {
      invalidateReviewQueries(queryClient, contentType, contentId);
      invalidateProfileStatistics(queryClient);
      invalidateRecommendationQueries(queryClient);
    },
  });
}

export function useUpdateReviewMutation(contentType: ReviewContentType, contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateReviewRequest) =>
      contentType === 'movie'
        ? updateMovieReview(contentId, payload)
        : updateTvReview(contentId, payload),
    onSuccess: () => {
      invalidateReviewQueries(queryClient, contentType, contentId);
    },
  });
}

export function useDeleteReviewMutation(contentType: ReviewContentType, contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      contentType === 'movie'
        ? deleteMovieReview(contentId)
        : deleteTvReview(contentId),
    onSuccess: () => {
      invalidateReviewQueries(queryClient, contentType, contentId);
      invalidateProfileStatistics(queryClient);
      invalidateRecommendationQueries(queryClient);
    },
  });
}
