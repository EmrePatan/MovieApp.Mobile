import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getWatchlist, getWatchlists } from '../api/watchlists-api';
import {
  watchlistMembershipQueryKey,
  watchlistsQueryKey,
} from './watchlist-query-keys';
import type { WatchlistContentType } from '../types';

export function useWatchlists(enabled = true) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: watchlistsQueryKey(),
    queryFn: ({ signal }) => getWatchlists(signal),
    enabled: isAuthenticated && enabled,
    staleTime: 30_000,
  });
}

export function useWatchlistMembership(
  contentType: WatchlistContentType,
  contentId: string,
  enabled = true,
) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: watchlistMembershipQueryKey(contentType, contentId),
    queryFn: async ({ signal }) => {
      const watchlists = await getWatchlists(signal);
      const membership: Record<string, boolean> = {};

      await Promise.all(
        watchlists.map(async (watchlist) => {
          const detail = await getWatchlist(watchlist.id, signal);
          membership[watchlist.id] =
            contentType === 'movie'
              ? detail.movies.some((item) => item.id === contentId)
              : detail.tvShows.some((item) => item.id === contentId);
        }),
      );

      return membership;
    },
    enabled: isAuthenticated && enabled && contentId.length > 0,
    staleTime: 15_000,
  });
}
