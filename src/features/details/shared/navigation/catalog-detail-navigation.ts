import type { QueryClient } from '@tanstack/react-query';
import type { ImperativeRouter } from 'expo-router';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import { getMovieDetailsByTmdbId } from '../../movie/api/movie-api';
import { getTvShowDetailsByTmdbId } from '../../tv/api/tv-api';
import type { PersonFilmographyEntry } from '../../person/types';
import { buildCatalogDetailRoute } from '../routes';
import { prefetchCatalogDetail } from './prefetch-catalog-detail';

export type CatalogDetailTabOrigin = 'home' | 'search' | 'watchlist' | 'discover' | 'library';

export type CatalogDetailLibraryOrigin =
  | 'upcoming'
  | 'following'
  | 'favorites'
  | 'discover'
  | 'watch-history';

export interface OpenCatalogDetailOptions {
  queryClient?: QueryClient;
  watchRegion?: string;
  /** Ignored: catalog detail return is handled by native root-stack history. */
  libraryReturnHref?: string;
}

let lastCatalogDetailWatchRegion: string | null = null;
let activeCatalogNavigationKey: string | null = null;

function pushCatalogDetailRoute(
  router: ImperativeRouter,
  href: string,
  navigationKey: string,
): void {
  if (activeCatalogNavigationKey === navigationKey) {
    return;
  }

  activeCatalogNavigationKey = navigationKey;
  router.push(href);

  setTimeout(() => {
    if (activeCatalogNavigationKey === navigationKey) {
      activeCatalogNavigationKey = null;
    }
  }, 750);
}

export async function openCatalogDetailFromFilmography(
  router: ImperativeRouter,
  entry: PersonFilmographyEntry,
  options?: OpenCatalogDetailOptions,
): Promise<string> {
  if (entry.catalogId) {
    const href = buildCatalogDetailRoute(entry.catalogId, entry.mediaType);
    if (options?.queryClient) {
      prefetchCatalogDetail(options.queryClient, entry.catalogId, entry.mediaType);
    }

    pushCatalogDetailRoute(router, href, `${entry.mediaType}:${entry.catalogId}`);
    return entry.catalogId;
  }

  const details = entry.mediaType === 'movie'
    ? await getMovieDetailsByTmdbId(entry.tmdbId)
    : await getTvShowDetailsByTmdbId(entry.tmdbId);

  if (options?.queryClient) {
    prefetchCatalogDetail(options.queryClient, details.id, entry.mediaType);
  }

  const href = buildCatalogDetailRoute(details.id, entry.mediaType);
  pushCatalogDetailRoute(router, href, `${entry.mediaType}:${details.id}`);
  return details.id;
}

export function getCatalogDetailWatchRegion(): string | null {
  return lastCatalogDetailWatchRegion;
}

export function openCatalogDetailFromTab(
  router: ImperativeRouter,
  id: string,
  type: 'movie' | 'tv',
  origin: CatalogDetailTabOrigin,
  options?: OpenCatalogDetailOptions,
): void {
  if (origin === 'discover') {
    trackProductMetric(PRODUCT_METRICS.contentDetailOpened);
  }

  lastCatalogDetailWatchRegion = options?.watchRegion ?? null;
  const href = buildCatalogDetailRoute(id, type);

  if (options?.queryClient) {
    prefetchCatalogDetail(options.queryClient, id, type);
  }

  pushCatalogDetailRoute(router, href, `${type}:${id}`);
}

export function openCatalogDetailFromLibraryStack(
  router: ImperativeRouter,
  id: string,
  type: 'movie' | 'tv',
  origin: CatalogDetailLibraryOrigin,
  options?: OpenCatalogDetailOptions,
): void {
  if (origin === 'discover') {
    trackProductMetric(PRODUCT_METRICS.contentDetailOpened);
  }

  lastCatalogDetailWatchRegion = options?.watchRegion ?? null;
  const href = buildCatalogDetailRoute(id, type);

  if (options?.queryClient) {
    prefetchCatalogDetail(options.queryClient, id, type);
  }

  router.push(href);
}

export function openDetailFromLibraryStack(
  router: ImperativeRouter,
  detailRoute: string,
  _origin: CatalogDetailLibraryOrigin,
  _libraryReturnHref?: string,
  watchRegion?: string,
): void {
  lastCatalogDetailWatchRegion = watchRegion ?? null;
  router.push(detailRoute);
}

export function resetCatalogDetailOriginForTests(): void {
  lastCatalogDetailWatchRegion = null;
  activeCatalogNavigationKey = null;
}
