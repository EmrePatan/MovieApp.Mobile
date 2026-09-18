import { useQuery } from '@tanstack/react-query';
import {
  getMovieReviewRatingDistribution,
  getTvReviewRatingDistribution,
} from '../api/reviews-api';
import {
  movieReviewRatingDistributionQueryKey,
  tvReviewRatingDistributionQueryKey,
} from './review-query-keys';
import type { ReviewContentType } from '../types';

export function useReviewRatingDistribution(
  contentType: ReviewContentType,
  contentId: string,
) {
  const movieQuery = useQuery({
    queryKey: movieReviewRatingDistributionQueryKey(contentId),
    queryFn: ({ signal }) => getMovieReviewRatingDistribution(contentId, signal),
    enabled: contentType === 'movie' && contentId.length > 0,
  });

  const tvQuery = useQuery({
    queryKey: tvReviewRatingDistributionQueryKey(contentId),
    queryFn: ({ signal }) => getTvReviewRatingDistribution(contentId, signal),
    enabled: contentType === 'tv' && contentId.length > 0,
  });

  return contentType === 'movie' ? movieQuery : tvQuery;
}
