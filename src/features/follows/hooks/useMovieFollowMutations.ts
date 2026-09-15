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
    onSuccess: (status) => {
      queryClient.setQueryData(movieFollowStatusQueryKey(movieId), status);
      removeFollowedCatalogFromHomeCaches(queryClient, movieId);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}
