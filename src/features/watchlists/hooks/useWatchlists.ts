import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import { getWatchlistMembership, getWatchlists } from '../api/watchlists-api';
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

function toMembershipRecord(watchlistIds: string[]): Record<string, boolean> {
  return Object.fromEntries(watchlistIds.map((watchlistId) => [watchlistId, true]));
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
      const membership = await getWatchlistMembership(contentType, contentId, signal);
      return toMembershipRecord(membership.watchlistIds);
    },
    enabled: isAuthenticated && enabled && contentId.length > 0,
    staleTime: 15_000,
  });
}
