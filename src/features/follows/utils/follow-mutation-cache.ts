import type { QueryClient } from '@tanstack/react-query';
import {
  movieFollowStatusQueryKey,
  tvShowFollowStatusQueryKey,
} from '../hooks/follow-query-keys';
import type { MovieFollowStatusResponse, TvShowFollowStatusResponse } from '../types';

export async function prepareTvShowFollowMutation(
  queryClient: QueryClient,
  tvShowId: string,
): Promise<TvShowFollowStatusResponse | undefined> {
  const queryKey = tvShowFollowStatusQueryKey(tvShowId);
  await queryClient.cancelQueries({ queryKey });
  return queryClient.getQueryData<TvShowFollowStatusResponse>(queryKey);
}

export async function prepareMovieFollowMutation(
  queryClient: QueryClient,
  movieId: string,
): Promise<MovieFollowStatusResponse | undefined> {
  const queryKey = movieFollowStatusQueryKey(movieId);
  await queryClient.cancelQueries({ queryKey });
  return queryClient.getQueryData<MovieFollowStatusResponse>(queryKey);
}

export function commitTvShowFollowStatus(
  queryClient: QueryClient,
  tvShowId: string,
  status: TvShowFollowStatusResponse,
): void {
  const queryKey = tvShowFollowStatusQueryKey(tvShowId);
  void queryClient.cancelQueries({ queryKey });
  queryClient.setQueryData(queryKey, status);
}

export function commitMovieFollowStatus(
  queryClient: QueryClient,
  movieId: string,
  status: MovieFollowStatusResponse,
): void {
  const queryKey = movieFollowStatusQueryKey(movieId);
  void queryClient.cancelQueries({ queryKey });
  queryClient.setQueryData(queryKey, status);
}
