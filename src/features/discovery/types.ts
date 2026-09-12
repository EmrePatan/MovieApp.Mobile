import type { SearchContentType } from '@/models/api/pagination';

export type DiscoveryTypeFilter = SearchContentType;

export interface DiscoveryRequest {
  page?: number;
  pageSize?: number;
  type?: DiscoveryTypeFilter;
}

export const DEFAULT_DISCOVERY_PAGE_SIZE = 20;

export type DiscoveryKind = 'popular' | 'trending';
