import { DEFAULT_REVIEW_PAGE_SIZE } from '../types';

export function movieReviewsInfiniteQueryKey(
  movieId: string,
  pageSize = DEFAULT_REVIEW_PAGE_SIZE,
) {
  return ['reviews', 'movie', movieId, pageSize] as const;
}

export function tvReviewsInfiniteQueryKey(
  tvShowId: string,
  pageSize = DEFAULT_REVIEW_PAGE_SIZE,
) {
  return ['reviews', 'tv', tvShowId, pageSize] as const;
}

export function movieMyReviewQueryKey(movieId: string) {
  return ['reviews', 'movie', movieId, 'me'] as const;
}

export function tvMyReviewQueryKey(tvShowId: string) {
  return ['reviews', 'tv', tvShowId, 'me'] as const;
}
