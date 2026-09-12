import type { RecommendationRequest, SimilarContentRequest } from '../types';
import { DEFAULT_RECOMMENDATION_PAGE_SIZE } from '../types';

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function buildRecommendationsPath(criteria: RecommendationRequest = {}): string {
  const params = new URLSearchParams({
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_RECOMMENDATION_PAGE_SIZE),
    type: criteria.type ?? 'all',
  });

  return `/api/recommendations?${params.toString()}`;
}

export function buildRecommendationHomePath(): string {
  return '/api/recommendations/home';
}

export function buildSimilarMoviesPath(
  movieId: string,
  criteria: SimilarContentRequest = {},
): string {
  const params = new URLSearchParams({
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_RECOMMENDATION_PAGE_SIZE),
  });

  return `/api/recommendations/movies/${encodePathSegment(movieId)}/similar?${params.toString()}`;
}

export function buildSimilarTvShowsPath(
  tvShowId: string,
  criteria: SimilarContentRequest = {},
): string {
  const params = new URLSearchParams({
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_RECOMMENDATION_PAGE_SIZE),
  });

  return `/api/recommendations/tvshows/${encodePathSegment(tvShowId)}/similar?${params.toString()}`;
}
