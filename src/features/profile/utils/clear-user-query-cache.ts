import type { QueryClient } from '@tanstack/react-query';

const USER_QUERY_PREFIXES = [
  ['profile'],
  ['favorites'],
  ['favorite'],
  ['watchlists'],
  ['watchlist'],
  ['watchlist-membership'],
  ['watch-history'],
  ['rating'],
  ['reviews'],
  ['search-history'],
  ['home'],
  ['notifications'],
  ['library'],
  ['insights'],
  ['recommendations'],
  ['ai-recommendations'],
  ['following'],
  ['movie-follow-status'],
  ['tv-show-follow-status'],
] as const;

export function clearUserQueryCache(queryClient: QueryClient) {
  for (const queryKey of USER_QUERY_PREFIXES) {
    void queryClient.removeQueries({ queryKey: [...queryKey] });
  }
}
