import { useInfiniteQuery } from '@tanstack/react-query';
import { getTvReviews } from '../api/reviews-api';
import { tvReviewsInfiniteQueryKey } from './review-query-keys';
import { DEFAULT_REVIEW_PAGE_SIZE } from '../types';

export function useTvShowReviews(tvShowId: string, pageSize = DEFAULT_REVIEW_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: tvReviewsInfiniteQueryKey(tvShowId, pageSize),
    queryFn: ({ pageParam, signal }) => getTvReviews(tvShowId, pageParam, pageSize, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: tvShowId.length > 0,
    staleTime: 30_000,
  });
}
