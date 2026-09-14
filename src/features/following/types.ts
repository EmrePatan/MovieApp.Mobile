import type { ContentType, PaginatedResponse } from '@/models/api/pagination';

export interface FollowingCatalogItem {
  id: string;
  type: ContentType;
  title: string;
  posterUrl: string | null;
  releaseDate: string | null;
  year: number | null;
}

export type FollowingCatalogResponse = PaginatedResponse<FollowingCatalogItem>;

export interface FollowingCatalogRequest {
  page?: number;
  pageSize?: number;
}

export const DEFAULT_FOLLOWING_PAGE_SIZE = 20;
