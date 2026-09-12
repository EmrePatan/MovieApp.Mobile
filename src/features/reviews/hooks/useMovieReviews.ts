import { useInfiniteQuery } from '@tanstack/react-query';
import { getMovieReviews } from '../api/reviews-api';
import { movieReviewsInfiniteQueryKey } from './review-query-keys';
import { DEFAULT_REVIEW_PAGE_SIZE } from '../types';

export function useMovieReviews(movieId: string, pageSize = DEFAULT_REVIEW_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: movieReviewsInfiniteQueryKey(movieId, pageSize),
    queryFn: ({ pageParam, signal }) => getMovieReviews(movieId, pageParam, pageSize, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: movieId.length > 0,
    staleTime: 30_000,
  });
}
