import { useQuery } from '@tanstack/react-query';
import { getTvShowDetails } from '../api/tv-api';
import { isValidGuid } from '../../shared/routes';

export function tvShowQueryKey(id: string) {
  return ['tvshow', id] as const;
}

export function useTvShowDetails(id: string | undefined) {
  const enabled = isValidGuid(id);

  return useQuery({
    queryKey: tvShowQueryKey(id ?? ''),
    queryFn: ({ signal }) => getTvShowDetails(id!, signal),
    enabled,
    staleTime: 60_000,
  });
}
