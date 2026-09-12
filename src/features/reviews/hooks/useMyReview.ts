import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getMovieMyReview, getTvMyReview } from '../api/reviews-api';
import { movieMyReviewQueryKey, tvMyReviewQueryKey } from './review-query-keys';
import type { ReviewContentType } from '../types';

export function useMyReview(contentType: ReviewContentType, contentId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey:
      contentType === 'movie'
        ? movieMyReviewQueryKey(contentId)
        : tvMyReviewQueryKey(contentId),
    queryFn: ({ signal }) =>
      contentType === 'movie'
        ? getMovieMyReview(contentId, signal)
        : getTvMyReview(contentId, signal),
    enabled: isAuthenticated && contentId.length > 0,
    staleTime: 30_000,
  });
}
