import { useQuery } from '@tanstack/react-query';
import { getGenres } from '../api/discovery-api';
import { genresQueryKey } from './discovery-query-keys';

const GENRES_STALE_TIME_MS = 24 * 60 * 60 * 1000;

export function useGenres() {
  return useQuery({
    queryKey: genresQueryKey(),
    queryFn: ({ signal }) => getGenres(signal),
    staleTime: GENRES_STALE_TIME_MS,
  });
}
