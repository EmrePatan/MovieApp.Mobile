import type { SearchTypeFilter } from '../types';
import { DEFAULT_SEARCH_PAGE_SIZE } from '../types';

export function searchQueryKey(
  normalizedQuery: string,
  typeFilter: SearchTypeFilter,
  pageSize = DEFAULT_SEARCH_PAGE_SIZE,
) {
  return ['search', normalizedQuery, typeFilter, pageSize] as const;
}

export function autocompleteQueryKey(normalizedQuery: string) {
  return ['autocomplete', normalizedQuery] as const;
}

export function searchHistoryQueryKey(page = 1, pageSize = DEFAULT_SEARCH_PAGE_SIZE) {
  return ['search-history', page, pageSize] as const;
}
