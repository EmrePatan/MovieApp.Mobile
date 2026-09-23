import { DEFAULT_UPCOMING_PAGE_SIZE } from '../types';

export const UPCOMING_CATALOG_QUERY_KEY_ROOT = ['upcoming', 'catalog'] as const;

export function upcomingCatalogInfiniteQueryKey(
  pageSize = DEFAULT_UPCOMING_PAGE_SIZE,
  scope: 'catalog' | 'followed' = 'followed',
  releaseRegion = 'TR',
): readonly ['upcoming', 'catalog', 'catalog' | 'followed', number, string] {
  return [...UPCOMING_CATALOG_QUERY_KEY_ROOT, scope, pageSize, releaseRegion];
}
