import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MovieFollowStatusResponse } from '../types';
import { commitMovieFollowStatus } from '../utils/follow-mutation-cache';
import { createUnfollowedMovieFollowStatus } from '../utils/follow-status-defaults';
import { removeFollowedCatalogFromHomeCaches } from '../utils/home-coming-up-cache';
import { invalidateFollowCatalogQueries } from '../utils/invalidate-follow-catalog-queries';
import { resolveMovieFollowRemoval } from '../utils/resolve-follow-removal';
import { resolveMovieFollowUpsert } from '../utils/resolve-movie-follow-upsert';
import { movieFollowStatusQueryKey } from './follow-query-keys';

export function useCreateMovieFollow(movieId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resolveMovieFollowUpsert(movieId),
    onMutate: async () => {
      const queryKey = movieFollowStatusQueryKey(movieId);
      const previous = queryClient.getQueryData<MovieFollowStatusResponse>(queryKey);
      queryClient.setQueryData<MovieFollowStatusResponse>(queryKey, {
        isFollowing: true,
      });
      await queryClient.cancelQueries({ queryKey });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(movieFollowStatusQueryKey(movieId), context.previous);
      }
    },
    onSuccess: (status) => {
      commitMovieFollowStatus(queryClient, movieId, status);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}

export function useRemoveMovieFollow(movieId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resolveMovieFollowRemoval(movieId),
    onMutate: async () => {
      const queryKey = movieFollowStatusQueryKey(movieId);
      const previous = queryClient.getQueryData<MovieFollowStatusResponse>(queryKey);
      queryClient.setQueryData<MovieFollowStatusResponse>(
        queryKey,
        createUnfollowedMovieFollowStatus(),
      );
      removeFollowedCatalogFromHomeCaches(queryClient, movieId);
      await queryClient.cancelQueries({ queryKey });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(movieFollowStatusQueryKey(movieId), context.previous);
      }
    },
    onSuccess: (status) => {
      commitMovieFollowStatus(queryClient, movieId, status);
      removeFollowedCatalogFromHomeCaches(queryClient, movieId);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}
