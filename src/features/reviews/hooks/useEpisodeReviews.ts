import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getEpisodeReviews } from '../api/reviews-api';
import { episodeReviewsQueryKey } from './review-query-keys';
import {
  DEFAULT_REVIEW_PAGE_SIZE,
  DEFAULT_REVIEW_SORT,
  type ReviewsQueryOptions,
} from '../types';

export function useEpisodeReviews(episodeId: string, options: ReviewsQueryOptions = {}) {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? DEFAULT_REVIEW_PAGE_SIZE;
  const sort = options.sort ?? DEFAULT_REVIEW_SORT;
  const ratingStars = options.ratingStars ?? null;

  return useQuery({
    queryKey: episodeReviewsQueryKey(episodeId, page, pageSize, sort, ratingStars),
    queryFn: ({ signal }) =>
      getEpisodeReviews(episodeId, page, pageSize, sort, ratingStars, signal),
    enabled: episodeId.length > 0,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
