import { useInfiniteQuery } from '@tanstack/react-query';
import { search } from '../api/search-api';
import { searchQueryKey } from './search-query-keys';
import { isValidSearchQuery, normalizeSearchQuery } from '../utils/search-query';
import type { SearchTypeFilter } from '../types';
import { DEFAULT_SEARCH_PAGE_SIZE } from '../types';

export function useSearchResults(
  submittedQuery: string,
  typeFilter: SearchTypeFilter,
) {
  const normalizedQuery = normalizeSearchQuery(submittedQuery);
  const enabled = isValidSearchQuery(normalizedQuery);

  return useInfiniteQuery({
    queryKey: searchQueryKey(normalizedQuery, typeFilter, DEFAULT_SEARCH_PAGE_SIZE),
    queryFn: ({ pageParam, signal }) =>
      search(
        {
          q: normalizedQuery,
          type: typeFilter,
          page: pageParam,
          pageSize: DEFAULT_SEARCH_PAGE_SIZE,
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled,
    staleTime: 60_000,
  });
}
