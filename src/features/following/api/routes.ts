import type { FollowingCatalogRequest } from '../types';
import { DEFAULT_FOLLOWING_PAGE_SIZE } from '../types';

export function buildFollowingCatalogPath(criteria: FollowingCatalogRequest = {}): string {
  const params = new URLSearchParams({
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_FOLLOWING_PAGE_SIZE),
  });

  return `/api/follows/catalog?${params.toString()}`;
}
