import type { SearchResultItem, SearchTypeFilter } from '@/features/search/types';
import {
  isValidSearchQuery,
  normalizeSearchQuery,
} from '@/features/search/utils/search-query';
import { searchLibrary } from './library-api';
import { mapLibraryItemToSearchResult } from '../utils/map-library-item-to-search-result';

const MAX_SEARCH_PAGES = 20;

export async function searchLibraryCatalog(
  query: string,
  typeFilter: SearchTypeFilter,
  signal?: AbortSignal,
): Promise<SearchResultItem[]> {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!isValidSearchQuery(normalizedQuery)) {
    return [];
  }

  const results: SearchResultItem[] = [];
  let page = 1;

  while (page <= MAX_SEARCH_PAGES) {
    const response = await searchLibrary(
      normalizedQuery,
      typeFilter === 'person' ? 'all' : typeFilter,
      page,
      signal,
    );

    for (const item of response.items) {
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        continue;
      }

      results.push(mapLibraryItemToSearchResult(item));
    }

    if (!response.hasNextPage) {
      break;
    }

    page += 1;
  }

  return results;
}
