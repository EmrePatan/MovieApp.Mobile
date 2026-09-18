import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getMovieReviews } from '../api/reviews-api';
import { movieReviewsQueryKey } from './review-query-keys';
import {
  DEFAULT_REVIEW_PAGE_SIZE,
  DEFAULT_REVIEW_SORT,
  type ReviewsQueryOptions,
} from '../types';

export function useMovieReviews(movieId: string, options: ReviewsQueryOptions = {}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? DEFAULT_REVIEW_PAGE_SIZE;
  const sort = options.sort ?? DEFAULT_REVIEW_SORT;

  return useQuery({
    queryKey: movieReviewsQueryKey(movieId, page, pageSize, sort),
    queryFn: ({ signal }) => getMovieReviews(movieId, page, pageSize, sort, signal),
    enabled: movieId.length > 0,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
