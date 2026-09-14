import type { QueryClient } from '@tanstack/react-query';
import { getMovieDetails } from '../../movie/api/movie-api';
import { movieQueryKey } from '../../movie/hooks/useMovieDetails';
import { getTvShowDetails } from '../../tv/api/tv-api';
import { tvShowQueryKey } from '../../tv/hooks/useTvShowDetails';
import { isValidGuid } from '../routes';

const CATALOG_DETAIL_STALE_TIME_MS = 60_000;

export function prefetchCatalogDetail(
  queryClient: QueryClient,
  id: string,
  type: 'movie' | 'tv',
): void {
  if (!isValidGuid(id)) {
    return;
  }

  if (type === 'movie') {
    void queryClient.prefetchQuery({
      queryKey: movieQueryKey(id),
      queryFn: ({ signal }) => getMovieDetails(id, signal),
      staleTime: CATALOG_DETAIL_STALE_TIME_MS,
    });
    return;
  }

  void queryClient.prefetchQuery({
    queryKey: tvShowQueryKey(id),
    queryFn: ({ signal }) => getTvShowDetails(id, signal),
    staleTime: CATALOG_DETAIL_STALE_TIME_MS,
  });
}
