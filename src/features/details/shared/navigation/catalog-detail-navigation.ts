import type { QueryClient } from '@tanstack/react-query';
import type { ImperativeRouter } from 'expo-router';
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

