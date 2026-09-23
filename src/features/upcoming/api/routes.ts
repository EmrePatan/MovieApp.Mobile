import type { UpcomingCatalogRequest } from '../types';
import { DEFAULT_UPCOMING_PAGE_SIZE } from '../types';

export function buildUpcomingCatalogPath(criteria: UpcomingCatalogRequest = {}): string {
  const params = new URLSearchParams({
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_UPCOMING_PAGE_SIZE),
  });

  if (criteria.scope) {
    params.set('scope', criteria.scope);
  }

  if (criteria.releaseRegion) {
    params.set('releaseRegion', criteria.releaseRegion);
  }

  return `/api/catalog/upcoming?${params.toString()}`;
}
