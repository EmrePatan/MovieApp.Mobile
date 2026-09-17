import { useMovieReviews } from './useMovieReviews';
import { useTvShowReviews } from './useTvShowReviews';
import type { ReviewContentType } from '../types';

export function useReviewsQuery(contentType: ReviewContentType, contentId: string, pageSize?: number) {
  const movieQuery = useMovieReviews(contentType === 'movie' ? contentId : '', pageSize);
  const tvQuery = useTvShowReviews(contentType === 'tv' ? contentId : '', pageSize);
  return contentType === 'movie' ? movieQuery : tvQuery;
}
