import { DEFAULT_UPCOMING_PAGE_SIZE } from '../types';

export function upcomingCatalogInfiniteQueryKey(
  pageSize = DEFAULT_UPCOMING_PAGE_SIZE,
): readonly ['upcoming', 'catalog', number] {
  return ['upcoming', 'catalog', pageSize];
}
