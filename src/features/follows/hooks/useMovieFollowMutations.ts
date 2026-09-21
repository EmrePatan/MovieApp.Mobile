import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MovieFollowStatusResponse } from '../types';
import {
  commitMovieFollowStatus,
  prepareMovieFollowMutation,
} from '../utils/follow-mutation-cache';
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
      const previous = await prepareMovieFollowMutation(queryClient, movieId);
      queryClient.setQueryData<MovieFollowStatusResponse>(movieFollowStatusQueryKey(movieId), {
        isFollowing: true,
      });
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
      const previous = await prepareMovieFollowMutation(queryClient, movieId);
      queryClient.setQueryData<MovieFollowStatusResponse>(
        movieFollowStatusQueryKey(movieId),
        createUnfollowedMovieFollowStatus(),
      );
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
