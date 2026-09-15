import { DEFAULT_FOLLOWING_PAGE_SIZE } from '../types';

export const FOLLOWING_CATALOG_QUERY_KEY_ROOT = ['following', 'catalog'] as const;

export function followingCatalogInfiniteQueryKey(
  pageSize = DEFAULT_FOLLOWING_PAGE_SIZE,
): readonly ['following', 'catalog', number] {
  return [...FOLLOWING_CATALOG_QUERY_KEY_ROOT, pageSize];
}
