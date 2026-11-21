import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getEpisodeMyReview, getMovieMyReview, getTvMyReview } from '../api/reviews-api';
import {
  episodeMyReviewQueryKey,
  movieMyReviewQueryKey,
  tvMyReviewQueryKey,
} from './review-query-keys';
import type { ReviewContentType } from '../types';

export function useMyReview(contentType: ReviewContentType, contentId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey:
      contentType === 'movie'
        ? movieMyReviewQueryKey(contentId)
        : contentType === 'tv'
          ? tvMyReviewQueryKey(contentId)
          : episodeMyReviewQueryKey(contentId),
    queryFn: ({ signal }) => {
      switch (contentType) {
        case 'movie':
          return getMovieMyReview(contentId, signal);
        case 'tv':
          return getTvMyReview(contentId, signal);
        case 'episode':
          return getEpisodeMyReview(contentId, signal);
      }
    },
    enabled: isAuthenticated && contentId.length > 0,
    staleTime: 30_000,
  });
}
