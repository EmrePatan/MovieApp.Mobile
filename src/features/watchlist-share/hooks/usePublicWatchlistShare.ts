import { useQuery } from '@tanstack/react-query';
import { getPublicWatchlistShare } from '../api/watchlist-share-api';

export function usePublicWatchlistShare(token: string) {
  return useQuery({
    queryKey: ['public-watchlist-share', token],
    queryFn: ({ signal }) => getPublicWatchlistShare(token, signal),
    retry: false,
  });
}
