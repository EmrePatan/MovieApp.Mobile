import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { favoriteStatusQueryKey } from '@/features/favorites/hooks/favorite-query-keys';
import {
  movieFollowStatusQueryKey,
  tvShowFollowStatusQueryKey,
} from '@/features/follows/hooks/follow-query-keys';
import {
  movieWatchStatusQueryKey,
} from '@/features/watch-history/hooks/watch-history-query-keys';
import { watchlistMembershipQueryKey } from '@/features/watchlists/hooks/watchlist-query-keys';
import type { LibraryActionMediaType, LibraryActionStatusResponse } from '../types';

function toMembershipRecord(watchlistIds: string[]): Record<string, boolean> {
  return Object.fromEntries(watchlistIds.map((watchlistId) => [watchlistId, true]));
}

function seedIfNotSuperseded<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  value: T,
  fetchStartedAt: number,
): void {
  const state = queryClient.getQueryState<T>(queryKey);
  if (state?.dataUpdatedAt && state.dataUpdatedAt > fetchStartedAt) {
    return;
  }

  queryClient.setQueryData(queryKey, value);
}

export function seedDetailActionCachesFromLibraryActions(
  queryClient: QueryClient,
  mediaType: LibraryActionMediaType,
  contentId: string,
  actions: LibraryActionStatusResponse,
  fetchStartedAt: number,
): void {
  seedIfNotSuperseded(
    queryClient,
    favoriteStatusQueryKey(mediaType, contentId),
    actions.isFavorited,
    fetchStartedAt,
  );

  seedIfNotSuperseded(
    queryClient,
    watchlistMembershipQueryKey(mediaType, contentId),
    toMembershipRecord(actions.watchlistIds),
    fetchStartedAt,
  );

  if (mediaType === 'movie') {
    seedIfNotSuperseded(
      queryClient,
      movieWatchStatusQueryKey(contentId),
      {
        movieId: contentId,
        isWatched: actions.isWatched ?? false,
        watchedAt: actions.watchedAt,
      },
      fetchStartedAt,
    );

    seedIfNotSuperseded(
      queryClient,
      movieFollowStatusQueryKey(contentId),
      { isFollowing: actions.isFollowing },
      fetchStartedAt,
    );
    return;
  }

  seedIfNotSuperseded(
    queryClient,
    tvShowFollowStatusQueryKey(contentId),
    {
      isFollowing: actions.isFollowing,
      notifyNewSeasons: actions.notifyNewSeasons,
      notifyNewEpisodes: actions.notifyNewEpisodes,
      baselineEstablished: actions.baselineEstablished,
    },
    fetchStartedAt,
  );
}
