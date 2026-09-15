export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<TItem> extends PaginationMeta {
  items: TItem[];
}

export type ContentType = 'movie' | 'tv';

export type SearchContentType = ContentType | 'person' | 'all';
