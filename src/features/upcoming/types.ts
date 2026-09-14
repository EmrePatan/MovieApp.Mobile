import type { CatalogItem } from '@/models/api/catalog';
import type { PaginatedResponse } from '@/models/api/pagination';

export interface UpcomingCatalogItem extends CatalogItem {
  isFollowed: boolean;
}

export type UpcomingCatalogResponse = PaginatedResponse<UpcomingCatalogItem>;

export interface UpcomingCatalogRequest {
  page?: number;
  pageSize?: number;
}

export const DEFAULT_UPCOMING_PAGE_SIZE = 20;
