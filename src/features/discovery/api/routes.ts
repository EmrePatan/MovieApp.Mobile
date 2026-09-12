import type { DiscoveryRequest } from '../types';
import { DEFAULT_DISCOVERY_PAGE_SIZE } from '../types';

export function buildPopularPath(criteria: DiscoveryRequest = {}): string {
  const params = new URLSearchParams({
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_DISCOVERY_PAGE_SIZE),
    type: criteria.type ?? 'all',
  });

  return `/api/discovery/popular?${params.toString()}`;
}

export function buildTrendingPath(criteria: DiscoveryRequest = {}): string {
  const params = new URLSearchParams({
    page: String(criteria.page ?? 1),
    pageSize: String(criteria.pageSize ?? DEFAULT_DISCOVERY_PAGE_SIZE),
    type: criteria.type ?? 'all',
  });

  return `/api/discovery/trending?${params.toString()}`;
}
