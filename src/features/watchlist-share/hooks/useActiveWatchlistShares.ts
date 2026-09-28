import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listActiveWatchlistShares } from '../api/watchlist-share-api';

export const activeWatchlistSharesQueryKey = ['watchlist-shares', 'active'] as const;

export function useActiveWatchlistShares(enabled = true) {
  return useQuery({
    queryKey: activeWatchlistSharesQueryKey,
    queryFn: ({ signal }) => listActiveWatchlistShares(signal),
    enabled,
  });
}

export function useInvalidateActiveWatchlistShares() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: activeWatchlistSharesQueryKey });
  };
}
