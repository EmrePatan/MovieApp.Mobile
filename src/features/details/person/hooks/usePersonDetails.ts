import { useQuery } from '@tanstack/react-query';
import { getPersonDetails } from '../api/person-api';
import { personDetailsQueryKey } from './person-query-keys';

const PERSON_STALE_TIME_MS = 6 * 60 * 60 * 1000;

export function usePersonDetails(tmdbId: number | null | undefined) {
  const enabled = typeof tmdbId === 'number' && tmdbId > 0;

  return useQuery({
    queryKey: personDetailsQueryKey(tmdbId ?? 0),
    queryFn: ({ signal }) => getPersonDetails(tmdbId!, signal),
    enabled,
    staleTime: PERSON_STALE_TIME_MS,
    retry: 1,
  });
}
