import { useQuery } from '@tanstack/react-query';
import { getMovieDetails } from '../api/movie-api';
import { isValidGuid } from '../../shared/routes';

export function movieQueryKey(id: string) {
  return ['movie', id] as const;
}

export function useMovieDetails(id: string | undefined) {
  const enabled = isValidGuid(id);

  return useQuery({
    queryKey: movieQueryKey(id ?? ''),
    queryFn: ({ signal }) => getMovieDetails(id!, signal),
    enabled,
    staleTime: 60_000,
  });
}
