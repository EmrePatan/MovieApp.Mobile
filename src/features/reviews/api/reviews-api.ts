import { api } from '@/api/client';
import { isApiError } from '@/api/errors';
import {
  buildCreateMovieReviewPath,
  buildCreateTvReviewPath,
  buildDeleteMovieReviewPath,
  buildDeleteTvReviewPath,
  buildMovieMyReviewPath,
  buildMovieReviewsPath,
  buildTvMyReviewPath,
  buildTvReviewsPath,
  buildUpdateMovieReviewPath,
  buildUpdateTvReviewPath,
} from './routes';
import type {
  CreateReviewRequest,
  ReviewListResponse,
  ReviewResponse,
  ReviewSortOption,
  UpdateReviewRequest,
} from '../types';

export async function getMovieReviews(
  movieId: string,
  page = 1,
  pageSize = 20,
  sort?: ReviewSortOption,
  signal?: AbortSignal,
): Promise<ReviewListResponse> {
  return api.get<ReviewListResponse>(buildMovieReviewsPath(movieId, page, pageSize, sort), {
    authenticated: false,
    signal,
  });
}

export async function getTvReviews(
  tvShowId: string,
  page = 1,
  pageSize = 20,
  sort?: ReviewSortOption,
  signal?: AbortSignal,
): Promise<ReviewListResponse> {
  return api.get<ReviewListResponse>(buildTvReviewsPath(tvShowId, page, pageSize, sort), {
    authenticated: false,
    signal,
  });
}

export async function getMovieMyReview(
  movieId: string,
  signal?: AbortSignal,
): Promise<ReviewResponse | null> {
  try {
    return await api.get<ReviewResponse>(buildMovieMyReviewPath(movieId), { signal });
  } catch (error) {
    if (isApiError(error) && error.kind === 'not_found') {
      return null;
    }

    throw error;
  }
}

export async function getTvMyReview(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<ReviewResponse | null> {
  try {
    return await api.get<ReviewResponse>(buildTvMyReviewPath(tvShowId), { signal });
  } catch (error) {
    if (isApiError(error) && error.kind === 'not_found') {
      return null;
    }

    throw error;
  }
}

export async function createMovieReview(
  movieId: string,
  payload: CreateReviewRequest,
): Promise<ReviewResponse> {
  return api.post<ReviewResponse>(buildCreateMovieReviewPath(movieId), payload);
}

export async function createTvReview(
  tvShowId: string,
  payload: CreateReviewRequest,
): Promise<ReviewResponse> {
  return api.post<ReviewResponse>(buildCreateTvReviewPath(tvShowId), payload);
}

export async function updateMovieReview(
  movieId: string,
  payload: UpdateReviewRequest,
): Promise<ReviewResponse> {
  return api.put<ReviewResponse>(buildUpdateMovieReviewPath(movieId), payload);
}

export async function updateTvReview(
  tvShowId: string,
  payload: UpdateReviewRequest,
): Promise<ReviewResponse> {
  return api.put<ReviewResponse>(buildUpdateTvReviewPath(tvShowId), payload);
}

export async function deleteMovieReview(movieId: string): Promise<void> {
  await api.delete<void>(buildDeleteMovieReviewPath(movieId));
}

export async function deleteTvReview(tvShowId: string): Promise<void> {
  await api.delete<void>(buildDeleteTvReviewPath(tvShowId));
}
