import { useQuery } from '@tanstack/react-query';
import { getSeason } from '../api/season-api';

export function useSeasonCatalog(
  tvShowId: string,
  seasonNumber: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ['catalog', 'tv', tvShowId, 'season', seasonNumber],
    queryFn: ({ signal }) => getSeason(tvShowId, seasonNumber, signal),
    enabled: enabled && tvShowId.length > 0 && seasonNumber >= 1,
    staleTime: 5 * 60_000,
  });
}
