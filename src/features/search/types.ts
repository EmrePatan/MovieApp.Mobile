import type { CatalogItem } from '@/models/api/catalog';
import type { PaginatedResponse, SearchContentType } from '@/models/api/pagination';

export type SearchResultItem = CatalogItem;

export type SearchResponse = PaginatedResponse<SearchResultItem>;

export interface SearchAutocompleteItem {
  id: string;
  type: 'movie' | 'tv';
  title: string;
}

export interface SearchAutocompleteResponse {
  items: SearchAutocompleteItem[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  searchedAt: string;
}

export type SearchHistoryResponse = PaginatedResponse<SearchHistoryItem>;

export type SearchTypeFilter = SearchContentType;

export interface SearchRequest {
  q: string;
  type?: SearchTypeFilter;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export const DEFAULT_SEARCH_PAGE_SIZE = 20;
export const DEFAULT_SEARCH_HISTORY_PAGE_SIZE = 20;
export const MIN_SEARCH_QUERY_LENGTH = 2;
export const MAX_SEARCH_QUERY_LENGTH = 100;
export const AUTOCOMPLETE_DEBOUNCE_MS = 300;
