import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import {
  getMovieMyRating,
  getMovieRatingAggregate,
  getTvMyRating,
  getTvRatingAggregate,
} from '../api/ratings-api';
import {
  movieMyRatingQueryKey,
  movieRatingAggregateQueryKey,
  tvMyRatingQueryKey,
  tvRatingAggregateQueryKey,
} from './rating-query-keys';
import type { RatingContentType } from '../types';

export function useMovieMyRating(movieId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: movieMyRatingQueryKey(movieId),
    queryFn: ({ signal }) => getMovieMyRating(movieId, signal),
    enabled: isAuthenticated && movieId.length > 0,
    staleTime: 30_000,
  });
}

export function useTvMyRating(tvShowId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: tvMyRatingQueryKey(tvShowId),
    queryFn: ({ signal }) => getTvMyRating(tvShowId, signal),
    enabled: isAuthenticated && tvShowId.length > 0,
    staleTime: 30_000,
  });
}

export function useMyRating(contentType: RatingContentType, contentId: string) {
  const { isAuthenticated } = useAuth();
  const enabled = isAuthenticated && contentId.length > 0;

  return useQuery({
    queryKey:
      contentType === 'movie'
        ? movieMyRatingQueryKey(contentId)
        : tvMyRatingQueryKey(contentId),
    queryFn: ({ signal }) =>
      contentType === 'movie'
        ? getMovieMyRating(contentId, signal)
        : getTvMyRating(contentId, signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useMovieRatingAggregate(movieId: string) {
  return useQuery({
    queryKey: movieRatingAggregateQueryKey(movieId),
    queryFn: ({ signal }) => getMovieRatingAggregate(movieId, signal),
    enabled: movieId.length > 0,
    staleTime: 60_000,
  });
}

export function useTvRatingAggregate(tvShowId: string) {
  return useQuery({
    queryKey: tvRatingAggregateQueryKey(tvShowId),
    queryFn: ({ signal }) => getTvRatingAggregate(tvShowId, signal),
    enabled: tvShowId.length > 0,
    staleTime: 60_000,
  });
}

export function useRatingAggregate(contentType: RatingContentType, contentId: string) {
  return useQuery({
    queryKey:
      contentType === 'movie'
        ? movieRatingAggregateQueryKey(contentId)
        : tvRatingAggregateQueryKey(contentId),
    queryFn: ({ signal }) =>
      contentType === 'movie'
        ? getMovieRatingAggregate(contentId, signal)
        : getTvRatingAggregate(contentId, signal),
    enabled: contentId.length > 0,
    staleTime: 60_000,
  });
}
