import type { QueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { getLibraryActionStatus } from '@/features/library-actions/api/library-actions-api';
import { libraryActionStatusQueryKey } from '@/features/library-actions/hooks/library-actions-query-keys';
import { seedDetailActionCachesFromLibraryActions } from '@/features/library-actions/utils/seed-detail-action-caches';
import { prefetchExternalRatings } from '@/features/external-ratings/hooks/external-ratings-query-options';
import { getTvShowProgress } from '@/features/watch-history/api/watch-history-api';
import { tvShowProgressQueryKey } from '@/features/watch-history/hooks/watch-history-query-keys';
import { getMovieDetails } from '../../movie/api/movie-api';
import { movieQueryKey } from '../../movie/hooks/useMovieDetails';
import { getTvShowDetails } from '../../tv/api/tv-api';
import { tvShowQueryKey } from '../../tv/hooks/useTvShowDetails';
import { isValidGuid } from '../routes';

const CATALOG_DETAIL_STALE_TIME_MS = 60_000;
const ACTION_STATUS_STALE_TIME_MS = 30_000;

function prefetchCatalogDetailActionStatuses(
  queryClient: QueryClient,
  id: string,
  type: 'movie' | 'tv',
): void {
  if (!api.hasAccessToken()) {
    return;
  }

  void queryClient.prefetchQuery({
    queryKey: libraryActionStatusQueryKey(type, id),
    queryFn: async ({ signal }) => {
      const fetchStartedAt = Date.now();
      const actions = await getLibraryActionStatus(type, id, signal);
      seedDetailActionCachesFromLibraryActions(queryClient, type, id, actions, fetchStartedAt);
      return actions;
    },
    staleTime: ACTION_STATUS_STALE_TIME_MS,
  });

  if (type === 'tv') {
    void queryClient.prefetchQuery({
      queryKey: tvShowProgressQueryKey(id),
      queryFn: ({ signal }) => getTvShowProgress(id, signal),
      staleTime: ACTION_STATUS_STALE_TIME_MS,
    });
  }
}

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
  } else {
    void queryClient.prefetchQuery({
      queryKey: tvShowQueryKey(id),
      queryFn: ({ signal }) => getTvShowDetails(id, signal),
      staleTime: CATALOG_DETAIL_STALE_TIME_MS,
    });
  }

  prefetchExternalRatings(queryClient, type, id);

  prefetchCatalogDetailActionStatuses(queryClient, id, type);
}
