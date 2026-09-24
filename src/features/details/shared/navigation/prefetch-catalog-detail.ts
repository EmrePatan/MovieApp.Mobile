import type { QueryClient } from '@tanstack/react-query';
import { getAccessToken } from '@/auth/auth-storage';
import { getMovieFavoriteStatus, getTvFavoriteStatus } from '@/features/favorites/api/favorites-api';
import { favoriteStatusQueryKey } from '@/features/favorites/hooks/favorite-query-keys';
import { getMovieFollowStatus } from '@/features/follows/api/movie-follow-api';
import { getTvShowFollowStatus } from '@/features/follows/api/follow-api';
import { movieFollowStatusQueryKey, tvShowFollowStatusQueryKey } from '@/features/follows/hooks/follow-query-keys';
import { getMovieWatchStatus, getTvShowProgress } from '@/features/watch-history/api/watch-history-api';
import {
  movieWatchStatusQueryKey,
  tvShowProgressQueryKey,
} from '@/features/watch-history/hooks/watch-history-query-keys';
import { getWatchlistMembership } from '@/features/watchlists/api/watchlists-api';
import { watchlistMembershipQueryKey } from '@/features/watchlists/hooks/watchlist-query-keys';
import { prefetchExternalRatings } from '@/features/external-ratings/hooks/external-ratings-query-options';
import { getMovieDetails } from '../../movie/api/movie-api';
import { movieQueryKey } from '../../movie/hooks/useMovieDetails';
import { getTvShowDetails } from '../../tv/api/tv-api';
import { tvShowQueryKey } from '../../tv/hooks/useTvShowDetails';
import { isValidGuid } from '../routes';

const CATALOG_DETAIL_STALE_TIME_MS = 60_000;
const ACTION_STATUS_STALE_TIME_MS = 30_000;
const WATCHLIST_MEMBERSHIP_STALE_TIME_MS = 15_000;

function toMembershipRecord(watchlistIds: string[]): Record<string, boolean> {
  return Object.fromEntries(watchlistIds.map((watchlistId) => [watchlistId, true]));
}

/**
 * Warms the detail-action-bar status queries (favorite, watchlist, watched, follow)
 * in parallel with the catalog detail navigation, so by the time the detail screen
 * mounts, `useFavoriteStatus`/`useWatchlistMembership`/`useMovieWatchStatus`/
 * `useTvShowProgress`/`useTvShowFollowStatus`/`useMovieFollowStatus` hit warm cache
 * instead of firing a fresh request. Uses the exact query keys those hooks use, so
 * this is a pure cache warm-up with no risk of duplicate in-flight requests.
 */
async function prefetchCatalogDetailActionStatuses(
  queryClient: QueryClient,
  id: string,
  type: 'movie' | 'tv',
): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    return;
  }

  void queryClient.prefetchQuery({
    queryKey: favoriteStatusQueryKey(type, id),
    queryFn: ({ signal }) =>
      type === 'movie'
        ? getMovieFavoriteStatus(id, signal).then((response) => response.isFavorited)
        : getTvFavoriteStatus(id, signal).then((response) => response.isFavorited),
    staleTime: ACTION_STATUS_STALE_TIME_MS,
  });

  void queryClient.prefetchQuery({
    queryKey: watchlistMembershipQueryKey(type, id),
    queryFn: async ({ signal }) => {
      const membership = await getWatchlistMembership(type, id, signal);
      return toMembershipRecord(membership.watchlistIds);
    },
    staleTime: WATCHLIST_MEMBERSHIP_STALE_TIME_MS,
  });

  if (type === 'movie') {
    void queryClient.prefetchQuery({
      queryKey: movieWatchStatusQueryKey(id),
      queryFn: ({ signal }) => getMovieWatchStatus(id, signal),
      staleTime: ACTION_STATUS_STALE_TIME_MS,
    });
    void queryClient.prefetchQuery({
      queryKey: movieFollowStatusQueryKey(id),
      queryFn: ({ signal }) => getMovieFollowStatus(id, signal),
      staleTime: ACTION_STATUS_STALE_TIME_MS,
    });
    return;
  }

  void queryClient.prefetchQuery({
    queryKey: tvShowProgressQueryKey(id),
    queryFn: ({ signal }) => getTvShowProgress(id, signal),
    staleTime: ACTION_STATUS_STALE_TIME_MS,
  });
  void queryClient.prefetchQuery({
    queryKey: tvShowFollowStatusQueryKey(id),
    queryFn: ({ signal }) => getTvShowFollowStatus(id, signal),
    staleTime: ACTION_STATUS_STALE_TIME_MS,
  });
}

export function prefetchCatalogDetail(
  queryClient: QueryClient,
  id: string,
  type: 'movie' | 'tv',
): void {
  if (!isValidGuid(id)) {
    return;
  }

  if (type === 'movie') {
    void queryClient.prefetchQuery({
      queryKey: movieQueryKey(id),
      queryFn: ({ signal }) => getMovieDetails(id, signal),
      staleTime: CATALOG_DETAIL_STALE_TIME_MS,
    });
  } else {
    void queryClient.prefetchQuery({
      queryKey: tvShowQueryKey(id),
      queryFn: ({ signal }) => getTvShowDetails(id, signal),
      staleTime: CATALOG_DETAIL_STALE_TIME_MS,
    });
  }

  prefetchExternalRatings(queryClient, type, id);

  void prefetchCatalogDetailActionStatuses(queryClient, id, type);
}
