import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeTvShowFollow, upsertTvShowFollow } from '../api/follow-api';
import type { TvShowFollowStatusResponse, UpsertTvShowFollowRequest } from '../types';
import { removeFollowedCatalogFromHomeCaches } from '../utils/home-coming-up-cache';
import { invalidateFollowCatalogQueries } from '../utils/invalidate-follow-catalog-queries';
import { tvShowFollowStatusQueryKey } from './follow-query-keys';

export function useCreateTvShowFollow(tvShowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpsertTvShowFollowRequest) => upsertTvShowFollow(tvShowId, request),
    onSuccess: (status) => {
      queryClient.setQueryData(tvShowFollowStatusQueryKey(tvShowId), status);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}

export function useUpdateTvShowFollow(tvShowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpsertTvShowFollowRequest) => upsertTvShowFollow(tvShowId, request),
    onSuccess: (status) => {
      queryClient.setQueryData(tvShowFollowStatusQueryKey(tvShowId), status);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}

export function useRemoveTvShowFollow(tvShowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await removeTvShowFollow(tvShowId);
      const status: TvShowFollowStatusResponse = {
        isFollowing: false,
        notifyNewSeasons: true,
        notifyNewEpisodes: true,
        baselineEstablished: false,
      };
      return status;
    },
    onSuccess: (status) => {
      queryClient.setQueryData(tvShowFollowStatusQueryKey(tvShowId), status);
      removeFollowedCatalogFromHomeCaches(queryClient, tvShowId);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}
