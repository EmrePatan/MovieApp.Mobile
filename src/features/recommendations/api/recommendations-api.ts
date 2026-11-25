import { api } from '@/api/client';
import {
  buildRecommendationDismissalsPath,
  buildRecommendationHomePath,
  buildRecommendationsPath,
  buildSimilarMoviesPath,
  buildSimilarTvShowsPath,
} from './routes';
import type {
  RecommendationHomeResponse,
  RecommendationRequest,
  RecommendationResponse,
  SimilarContentRequest,
} from '../types';

export async function getRecommendations(
  criteria: RecommendationRequest = {},
  signal?: AbortSignal,
): Promise<RecommendationResponse> {
  return api.get<RecommendationResponse>(buildRecommendationsPath(criteria), { signal });
}

export async function getRecommendationHome(
  signal?: AbortSignal,
): Promise<RecommendationHomeResponse> {
  return api.get<RecommendationHomeResponse>(buildRecommendationHomePath(), { signal });
}

export type RecommendationDismissContentType = 'movie' | 'tv';

/**
 * "Not interested" for a recommended title. The backend treats repeats as a no-op.
 */
export async function dismissRecommendation(
  contentType: RecommendationDismissContentType,
  contentId: string,
): Promise<void> {
  await api.post<void>(buildRecommendationDismissalsPath(), { contentType, contentId });
}

export async function getSimilarMovies(
  movieId: string,
  criteria: SimilarContentRequest = {},
  signal?: AbortSignal,
): Promise<RecommendationResponse> {
  return api.get<RecommendationResponse>(buildSimilarMoviesPath(movieId, criteria), {
    authenticated: false,
    signal,
  });
}

export async function getSimilarTvShows(
  tvShowId: string,
  criteria: SimilarContentRequest = {},
  signal?: AbortSignal,
): Promise<RecommendationResponse> {
  return api.get<RecommendationResponse>(buildSimilarTvShowsPath(tvShowId, criteria), {
    authenticated: false,
    signal,
  });
}
