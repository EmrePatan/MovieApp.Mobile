import type { QueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { libraryActionStatusQueryKey } from '@/features/library-actions/hooks/library-actions-query-keys';
import { fetchAndSeedLibraryActionStatus } from '@/features/library-actions/utils/fetch-and-seed-library-action-status';
import { prefetchExternalRatings } from '@/features/external-ratings/hooks/external-ratings-query-options';
import { getTvShowProgress } from '@/features/watch-history/api/watch-history-api';
import { tvShowProgressQueryKey } from '@/features/watch-history/hooks/watch-history-query-keys';
import { resolveDetailQueryLocaleTag } from '@/features/locale/detail-query-locale';
import { resolveImageUri } from '@/utils/image-url';
import { getMovieDetails } from '../../movie/api/movie-api';
import { movieQueryKey } from '../../movie/hooks/useMovieDetails';
import { getTvShowDetails } from '../../tv/api/tv-api';
import { tvShowQueryKey } from '../../tv/hooks/useTvShowDetails';
import { isValidGuid } from '../routes';

const CATALOG_DETAIL_STALE_TIME_MS = 60_000;
const ACTION_STATUS_STALE_TIME_MS = 30_000;

function prefetchRemoteImage(uri: string): void {
  void import('react-native')
    .then((reactNative: { Image?: { prefetch?: (nextUri: string) => Promise<unknown> } }) => {
      const prefetch = reactNative.Image?.prefetch;
      if (typeof prefetch !== 'function') {
        return undefined;
      }

      return prefetch(uri).catch(() => undefined);
    })
    .catch(() => undefined);
}

function prefetchCatalogHeroImages(
  posterPath?: string | null,
  backdropPath?: string | null,
): void {
  const heroUri = resolveImageUri(backdropPath ?? posterPath);
  const posterUri = resolveImageUri(posterPath);
  const uris = heroUri && posterUri && heroUri !== posterUri ? [heroUri, posterUri] : [heroUri ?? posterUri];

  for (const uri of uris) {
    if (uri) {
      prefetchRemoteImage(uri);
    }
  }
}

function prefetchCatalogDetailRecord(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: (signal: AbortSignal) => Promise<{ posterPath?: string | null; backdropPath?: string | null }>,
): void {
  void queryClient
    .prefetchQuery({
      queryKey,
      queryFn: ({ signal }) => queryFn(signal),
      staleTime: CATALOG_DETAIL_STALE_TIME_MS,
    })
    .then(() => {
      const record = queryClient.getQueryData<{
        posterPath?: string | null;
        backdropPath?: string | null;
      }>(queryKey);
      if (record) {
        prefetchCatalogHeroImages(record.posterPath, record.backdropPath);
      }
    });
}

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
    queryFn: ({ signal }) => fetchAndSeedLibraryActionStatus(queryClient, type, id, signal),
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

  const localeTag = resolveDetailQueryLocaleTag();

  if (type === 'movie') {
    prefetchCatalogDetailRecord(queryClient, movieQueryKey(id, localeTag), (signal) =>
      getMovieDetails(id, signal),
    );
  } else {
    prefetchCatalogDetailRecord(queryClient, tvShowQueryKey(id, localeTag), (signal) =>
      getTvShowDetails(id, signal),
    );
  }

  prefetchExternalRatings(queryClient, type, id);

  prefetchCatalogDetailActionStatuses(queryClient, id, type);
}
