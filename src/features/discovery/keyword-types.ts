export interface DiscoveryKeywordItem {
  id: string;
  name: string;
}

export interface DiscoveryKeywordsResponse {
  items: DiscoveryKeywordItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DiscoveryKeywordsRequest {
  query: string;
  page?: number;
  pageSize?: number;
}
