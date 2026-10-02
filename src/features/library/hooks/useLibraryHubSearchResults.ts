import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import type { CatalogMediaFilter } from '../types';
import { searchLibrary } from '../api/library-api';
import { DEFAULT_LIBRARY_PAGE_SIZE } from '../types/library';
import { isValidSearchQuery, normalizeSearchQuery } from '@/features/search/utils/search-query';

export function libraryHubSearchQueryKey(query: string, mediaType: CatalogMediaFilter) {
  return ['library-hub-search', query, mediaType] as const;
}

export function useLibraryHubSearchResults(
  submittedQuery: string,
  mediaType: CatalogMediaFilter,
) {
  const { isAuthenticated } = useAuth();
  const normalizedQuery = normalizeSearchQuery(submittedQuery);
  const enabled = isAuthenticated && isValidSearchQuery(normalizedQuery);

  return useInfiniteQuery({
    queryKey: libraryHubSearchQueryKey(normalizedQuery, mediaType),
    queryFn: ({ pageParam, signal }) =>
      searchLibrary(
        normalizedQuery,
        mediaType,
        typeof pageParam === 'number' ? pageParam : 1,
        DEFAULT_LIBRARY_PAGE_SIZE,
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled,
    staleTime: 30_000,
  });
}
