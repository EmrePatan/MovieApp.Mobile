import { api } from '@/api/client';
import {
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
