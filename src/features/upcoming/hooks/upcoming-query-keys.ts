import { DEFAULT_UPCOMING_PAGE_SIZE } from '../types';

export const UPCOMING_CATALOG_QUERY_KEY_ROOT = ['upcoming', 'catalog'] as const;

export function upcomingCatalogInfiniteQueryKey(
  pageSize = DEFAULT_UPCOMING_PAGE_SIZE,
): readonly ['upcoming', 'catalog', number] {
  return [...UPCOMING_CATALOG_QUERY_KEY_ROOT, pageSize];
}
