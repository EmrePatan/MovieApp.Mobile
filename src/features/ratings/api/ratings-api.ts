import { api } from '@/api/client';
import { isApiError } from '@/api/errors';
import {
  buildDeleteMovieRatingPath,
  buildDeleteTvRatingPath,
  buildMovieMyRatingPath,
  buildMovieRatingAggregatePath,
  buildRateMoviePath,
  buildRateTvShowPath,
  buildTvMyRatingPath,
  buildTvRatingAggregatePath,
} from './routes';
import type { CreateRatingRequest, RatingResponse, RatingSummaryResponse } from '../types';

export async function getMovieMyRating(
  movieId: string,
  signal?: AbortSignal,
): Promise<RatingResponse | null> {
  try {
    return await api.get<RatingResponse>(buildMovieMyRatingPath(movieId), { signal });
  } catch (error) {
    if (isApiError(error) && error.kind === 'not_found') {
      return null;
    }

    throw error;
  }
}

export async function getTvMyRating(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<RatingResponse | null> {
  try {
    return await api.get<RatingResponse>(buildTvMyRatingPath(tvShowId), { signal });
  } catch (error) {
    if (isApiError(error) && error.kind === 'not_found') {
      return null;
    }

    throw error;
  }
}

export async function getMovieRatingAggregate(
  movieId: string,
  signal?: AbortSignal,
): Promise<RatingSummaryResponse> {
  return api.get<RatingSummaryResponse>(buildMovieRatingAggregatePath(movieId), {
    authenticated: false,
    signal,
  });
}

export async function getTvRatingAggregate(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<RatingSummaryResponse> {
  return api.get<RatingSummaryResponse>(buildTvRatingAggregatePath(tvShowId), {
    authenticated: false,
    signal,
  });
}

export async function rateMovie(movieId: string, score: number): Promise<RatingResponse> {
  const body: CreateRatingRequest = { score };
  return api.post<RatingResponse>(buildRateMoviePath(movieId), body);
}

export async function rateTvShow(tvShowId: string, score: number): Promise<RatingResponse> {
  const body: CreateRatingRequest = { score };
  return api.post<RatingResponse>(buildRateTvShowPath(tvShowId), body);
}

export async function deleteMovieRating(movieId: string): Promise<void> {
  await api.delete<void>(buildDeleteMovieRatingPath(movieId));
}

export async function deleteTvRating(tvShowId: string): Promise<void> {
  await api.delete<void>(buildDeleteTvRatingPath(tvShowId));
}
