import { useQuery } from '@tanstack/react-query';
import { getSeason } from '../api/season-api';
import { isValidGuid } from '../../shared/routes';

export function seasonQueryKey(tvShowId: string, seasonNumber: number) {
  return ['season', tvShowId, seasonNumber] as const;
}

export function useSeason(tvShowId: string | undefined, seasonNumber: number | null) {
  const enabled = isValidGuid(tvShowId) && seasonNumber != null && seasonNumber >= 1;

  return useQuery({
    queryKey: seasonQueryKey(tvShowId ?? '', seasonNumber ?? 0),
    queryFn: ({ signal }) => getSeason(tvShowId!, seasonNumber!, signal),
    enabled,
    staleTime: 60_000,
  });
}
