import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMovieFollow, removeMovieFollow } from '../api/movie-follow-api';
import type { MovieFollowStatusResponse } from '../types';
import { removeFollowedCatalogFromHomeCaches } from '../utils/home-coming-up-cache';
import { invalidateFollowCatalogQueries } from '../utils/invalidate-follow-catalog-queries';
import { movieFollowStatusQueryKey } from './follow-query-keys';

export function useCreateMovieFollow(movieId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createMovieFollow(movieId),
    onMutate: async () => {
      const queryKey = movieFollowStatusQueryKey(movieId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MovieFollowStatusResponse>(queryKey);
      queryClient.setQueryData<MovieFollowStatusResponse>(queryKey, { isFollowing: true });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(movieFollowStatusQueryKey(movieId), context.previous);
      }
    },
    onSuccess: (status) => {
      queryClient.setQueryData(movieFollowStatusQueryKey(movieId), status);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}

export function useRemoveMovieFollow(movieId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await removeMovieFollow(movieId);
      const status: MovieFollowStatusResponse = { isFollowing: false };
      return status;
    },
    onMutate: async () => {
      const queryKey = movieFollowStatusQueryKey(movieId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MovieFollowStatusResponse>(queryKey);
      queryClient.setQueryData<MovieFollowStatusResponse>(queryKey, { isFollowing: false });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(movieFollowStatusQueryKey(movieId), context.previous);
      }
    },
    onSuccess: (status) => {
      queryClient.setQueryData(movieFollowStatusQueryKey(movieId), status);
      removeFollowedCatalogFromHomeCaches(queryClient, movieId);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}
