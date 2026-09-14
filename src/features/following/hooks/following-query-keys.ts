import { DEFAULT_FOLLOWING_PAGE_SIZE } from '../types';

export function followingCatalogInfiniteQueryKey(
  pageSize = DEFAULT_FOLLOWING_PAGE_SIZE,
): readonly ['following', 'catalog', number] {
  return ['following', 'catalog', pageSize];
}
