import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getTvReviews } from '../api/reviews-api';
import { tvReviewsQueryKey } from './review-query-keys';
import {
  DEFAULT_REVIEW_PAGE_SIZE,
  DEFAULT_REVIEW_SORT,
  type ReviewsQueryOptions,
} from '../types';

export function useTvShowReviews(tvShowId: string, options: ReviewsQueryOptions = {}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? DEFAULT_REVIEW_PAGE_SIZE;
  const sort = options.sort ?? DEFAULT_REVIEW_SORT;

  return useQuery({
    queryKey: tvReviewsQueryKey(tvShowId, page, pageSize, sort),
    queryFn: ({ signal }) => getTvReviews(tvShowId, page, pageSize, sort, signal),
    enabled: tvShowId.length > 0,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
