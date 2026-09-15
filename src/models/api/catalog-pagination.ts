import type { PaginationMeta } from './pagination';

export function getCatalogNextPageParam(
  lastPage: Pick<PaginationMeta, 'page' | 'totalPages'>,
): number | undefined {
  return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
}
