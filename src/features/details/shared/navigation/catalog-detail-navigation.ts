import type { QueryClient } from '@tanstack/react-query';
import type { ImperativeRouter } from 'expo-router';
import { getMovieDetailsByTmdbId } from '../../movie/api/movie-api';
import { getTvShowDetailsByTmdbId } from '../../tv/api/tv-api';
import type { PersonFilmographyEntry } from '../../person/types';
import { buildCatalogDetailRoute } from '../routes';
import { prefetchCatalogDetail } from './prefetch-catalog-detail';



export type CatalogDetailTabOrigin = 'home' | 'search' | 'watchlist';

export interface OpenCatalogDetailOptions {
  queryClient?: QueryClient;
}



const TAB_ORIGIN_HREFS: Record<CatalogDetailTabOrigin, `/(tabs)/${CatalogDetailTabOrigin}`> = {

  home: '/(tabs)/home',

  search: '/(tabs)/search',

  watchlist: '/(tabs)/watchlist',

};



let lastCatalogDetailOrigin: CatalogDetailTabOrigin | null = null;



export function isRootCatalogDetailRoute(segments: readonly string[]): boolean {

  const tabsIndex = segments.indexOf('(tabs)');

  if (tabsIndex === -1) {

    return false;

  }



  const section = segments[tabsIndex + 1];

  if (section === 'movie') {

    return true;

  }



  return section === 'tv' && !segments.includes('season');

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

    router.push(href);
    return entry.catalogId;
  }

  const details = entry.mediaType === 'movie'
    ? await getMovieDetailsByTmdbId(entry.tmdbId)
    : await getTvShowDetailsByTmdbId(entry.tmdbId);

  if (options?.queryClient) {
    prefetchCatalogDetail(options.queryClient, details.id, entry.mediaType);
  }

  router.push(buildCatalogDetailRoute(details.id, entry.mediaType));
  return details.id;
}

export function openCatalogDetailFromTab(
  router: ImperativeRouter,
  id: string,
  type: 'movie' | 'tv',
  origin: CatalogDetailTabOrigin,
  options?: OpenCatalogDetailOptions,
): void {
  lastCatalogDetailOrigin = origin;
  const href = buildCatalogDetailRoute(id, type);

  if (options?.queryClient) {
    prefetchCatalogDetail(options.queryClient, id, type);
  }

  if (origin === 'home') {
    router.replace(href);
    return;
  }

  router.push(href);
}



export function returnToCatalogDetailOrigin(router: ImperativeRouter): void {

  const href = lastCatalogDetailOrigin

    ? TAB_ORIGIN_HREFS[lastCatalogDetailOrigin]

    : '/(tabs)/home';



  router.navigate(href);

}



export function resetCatalogDetailOriginForTests(): void {

  lastCatalogDetailOrigin = null;

}

