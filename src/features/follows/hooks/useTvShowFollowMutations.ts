import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TvShowFollowStatusResponse, UpsertTvShowFollowRequest } from '../types';
import {
  commitTvShowFollowStatus,
  prepareTvShowFollowMutation,
} from '../utils/follow-mutation-cache';
import { createUnfollowedTvFollowStatus } from '../utils/follow-status-defaults';
import { removeFollowedCatalogFromHomeCaches } from '../utils/home-coming-up-cache';
import { invalidateFollowCatalogQueries } from '../utils/invalidate-follow-catalog-queries';
import { resolveTvShowFollowRemoval } from '../utils/resolve-follow-removal';
import { resolveTvShowFollowUpsert } from '../utils/resolve-follow-upsert';
import { tvShowFollowStatusQueryKey } from './follow-query-keys';

function applyOptimisticTvFollowPreferences(
  previous: TvShowFollowStatusResponse | undefined,
  request: UpsertTvShowFollowRequest,
): TvShowFollowStatusResponse {
  return {
    isFollowing: true,
    notifyNewSeasons: request.notifyNewSeasons ?? previous?.notifyNewSeasons ?? true,
    notifyNewEpisodes: request.notifyNewEpisodes ?? previous?.notifyNewEpisodes ?? true,
    baselineEstablished: previous?.baselineEstablished ?? false,
  };
}

export function useCreateTvShowFollow(tvShowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpsertTvShowFollowRequest) =>
      resolveTvShowFollowUpsert(tvShowId, request),
    onMutate: async (request) => {
      const previous = await prepareTvShowFollowMutation(queryClient, tvShowId);
      queryClient.setQueryData<TvShowFollowStatusResponse>(
        tvShowFollowStatusQueryKey(tvShowId),
        applyOptimisticTvFollowPreferences(previous, request),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(tvShowFollowStatusQueryKey(tvShowId), context.previous);
      }
    },
    onSuccess: (status) => {
      commitTvShowFollowStatus(queryClient, tvShowId, status);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}

export function useUpdateTvShowFollow(tvShowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpsertTvShowFollowRequest) =>
      resolveTvShowFollowUpsert(tvShowId, request),
    onMutate: async (request) => {
      const previous = await prepareTvShowFollowMutation(queryClient, tvShowId);
      queryClient.setQueryData<TvShowFollowStatusResponse>(
        tvShowFollowStatusQueryKey(tvShowId),
        applyOptimisticTvFollowPreferences(previous, request),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(tvShowFollowStatusQueryKey(tvShowId), context.previous);
      }
    },
    onSuccess: (status) => {
      commitTvShowFollowStatus(queryClient, tvShowId, status);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}

export function useRemoveTvShowFollow(tvShowId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resolveTvShowFollowRemoval(tvShowId),
    onMutate: async () => {
      const previous = await prepareTvShowFollowMutation(queryClient, tvShowId);
      queryClient.setQueryData<TvShowFollowStatusResponse>(
        tvShowFollowStatusQueryKey(tvShowId),
        createUnfollowedTvFollowStatus(),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(tvShowFollowStatusQueryKey(tvShowId), context.previous);
      }
    },
    onSuccess: (status) => {
      commitTvShowFollowStatus(queryClient, tvShowId, status);
      removeFollowedCatalogFromHomeCaches(queryClient, tvShowId);
      invalidateFollowCatalogQueries(queryClient);
    },
  });
}
