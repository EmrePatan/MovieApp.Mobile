import { DEFAULT_REVIEW_PAGE_SIZE, DEFAULT_REVIEW_SORT, type ReviewSortOption } from '../types';

export function movieReviewsQueryKey(
  movieId: string,
  page: number,
  pageSize = DEFAULT_REVIEW_PAGE_SIZE,
  sort: ReviewSortOption = DEFAULT_REVIEW_SORT,
  ratingStars: number | null = null,
) {
  return ['reviews', 'movie', movieId, page, pageSize, sort, ratingStars] as const;
}

export function tvReviewsQueryKey(
  tvShowId: string,
  page: number,
  pageSize = DEFAULT_REVIEW_PAGE_SIZE,
  sort: ReviewSortOption = DEFAULT_REVIEW_SORT,
  ratingStars: number | null = null,
) {
  return ['reviews', 'tv', tvShowId, page, pageSize, sort, ratingStars] as const;
}

export function movieMyReviewQueryKey(movieId: string) {
  return ['reviews', 'movie', movieId, 'me'] as const;
}

export function tvMyReviewQueryKey(tvShowId: string) {
  return ['reviews', 'tv', tvShowId, 'me'] as const;
}

export function movieReviewRatingDistributionQueryKey(movieId: string) {
  return ['reviews', 'movie', movieId, 'rating-distribution'] as const;
}

export function tvReviewRatingDistributionQueryKey(tvShowId: string) {
  return ['reviews', 'tv', tvShowId, 'rating-distribution'] as const;
}
