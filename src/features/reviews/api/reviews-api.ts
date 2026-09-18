import { api } from '@/api/client';
import { isApiError } from '@/api/errors';
import {
  buildCreateMovieReviewPath,
  buildCreateTvReviewPath,
  buildDeleteMovieReviewPath,
  buildDeleteTvReviewPath,
  buildMovieMyReviewPath,
  buildMovieReviewRatingDistributionPath,
  buildMovieReviewsPath,
  buildTvMyReviewPath,
  buildTvReviewRatingDistributionPath,
  buildTvReviewsPath,
  buildUpdateMovieReviewPath,
  buildUpdateTvReviewPath,
} from './routes';
import type {
  CreateReviewRequest,
  ReviewListResponse,
  ReviewRatingDistributionResponse,
  ReviewResponse,
  ReviewSortOption,
  UpdateReviewRequest,
} from '../types';

export const EMPTY_REVIEW_RATING_DISTRIBUTION: ReviewRatingDistributionResponse = {
  averageScore: 0,
  ratedReviewCount: 0,
  scoreDistribution: {},
};

export async function getMovieReviews(
  movieId: string,
  page = 1,
  pageSize = 20,
  sort?: ReviewSortOption,
  ratingStars?: number | null,
  signal?: AbortSignal,
): Promise<ReviewListResponse> {
  return api.get<ReviewListResponse>(
    buildMovieReviewsPath(movieId, page, pageSize, sort, ratingStars),
    {
      authenticated: false,
      signal,
    },
  );
}

export async function getTvReviews(
  tvShowId: string,
  page = 1,
  pageSize = 20,
  sort?: ReviewSortOption,
  ratingStars?: number | null,
  signal?: AbortSignal,
): Promise<ReviewListResponse> {
  return api.get<ReviewListResponse>(
    buildTvReviewsPath(tvShowId, page, pageSize, sort, ratingStars),
    {
      authenticated: false,
      signal,
    },
  );
}

export async function getMovieReviewRatingDistribution(
  movieId: string,
  signal?: AbortSignal,
): Promise<ReviewRatingDistributionResponse> {
  try {
    return await api.get<ReviewRatingDistributionResponse>(
      buildMovieReviewRatingDistributionPath(movieId),
      {
        authenticated: false,
        signal,
      },
    );
  } catch (error) {
    if (isApiError(error) && (error.kind === 'not_found' || error.status === 404)) {
      return EMPTY_REVIEW_RATING_DISTRIBUTION;
    }

    throw error;
  }
}

export async function getTvReviewRatingDistribution(
  tvShowId: string,
  signal?: AbortSignal,
): Promise<ReviewRatingDistributionResponse> {
  try {
    return await api.get<ReviewRatingDistributionResponse>(
      buildTvReviewRatingDistributionPath(tvShowId),
      {
        authenticated: false,
        signal,
      },
    );
  } catch (error) {
    if (isApiError(error) && (error.kind === 'not_found' || error.status === 404)) {
      return EMPTY_REVIEW_RATING_DISTRIBUTION;
    }

    throw error;
  }
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
