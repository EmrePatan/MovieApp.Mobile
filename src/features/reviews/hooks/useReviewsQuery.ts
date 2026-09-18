import { useMovieReviews } from './useMovieReviews';
import { useTvShowReviews } from './useTvShowReviews';
import type { ReviewContentType, ReviewsQueryOptions } from '../types';

export function useReviewsQuery(
  contentType: ReviewContentType,
  contentId: string,
  options: ReviewsQueryOptions = {},
) {
  const movieQuery = useMovieReviews(contentType === 'movie' ? contentId : '', options);
  const tvQuery = useTvShowReviews(contentType === 'tv' ? contentId : '', options);
  return contentType === 'movie' ? movieQuery : tvQuery;
}
