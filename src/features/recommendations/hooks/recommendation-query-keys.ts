import type { SearchContentType } from '@/models/api/pagination';
import { DEFAULT_RECOMMENDATION_PAGE_SIZE } from '../types';

export function recommendationsInfiniteQueryKey(
  type: SearchContentType = 'all',
  pageSize = DEFAULT_RECOMMENDATION_PAGE_SIZE,
) {
  return ['recommendations', 'list', type, pageSize] as const;
}

export function recommendationHomeQueryKey() {
  return ['recommendations', 'home'] as const;
}

export function similarMoviesQueryKey(movieId: string, pageSize = DEFAULT_RECOMMENDATION_PAGE_SIZE) {
  return ['recommendations', 'similar', 'movie', movieId, pageSize] as const;
}

export function similarTvShowsQueryKey(tvShowId: string, pageSize = DEFAULT_RECOMMENDATION_PAGE_SIZE) {
  return ['recommendations', 'similar', 'tv', tvShowId, pageSize] as const;
}
