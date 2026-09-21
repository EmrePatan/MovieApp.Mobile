import type { CatalogItem } from '@/models/api/catalog';
import type { PaginatedResponse, SearchContentType } from '@/models/api/pagination';

export interface PersonSearchResultItem {
  id: string;
  type: 'person';
  title: string;
  tmdbId: number;
  knownForDepartment: string | null;
  posterUrl: string | null;
  overview?: string;
}

export type CatalogSearchResultItem = CatalogItem;

export type SearchResultItem = CatalogSearchResultItem | PersonSearchResultItem;

export function isPersonSearchResult(item: SearchResultItem): item is PersonSearchResultItem {
  return item.type === 'person';
}

export type SearchResponse = PaginatedResponse<SearchResultItem>;

export interface SearchAutocompleteItem {
  id: string;
  type: 'movie' | 'tv' | 'person';
  title: string;
  posterUrl: string | null;
  tmdbId?: number | null;
  knownForDepartment?: string | null;
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
