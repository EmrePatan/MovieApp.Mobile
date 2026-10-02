import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/auth/useAuth';
import type { SearchTypeFilter } from '@/features/search/types';
import {
  isValidSearchQuery,
  normalizeSearchQuery,
} from '@/features/search/utils/search-query';
import { searchLibraryCatalog } from '../api/search-library-catalog';

export function librarySearchQueryKey(query: string, typeFilter: SearchTypeFilter) {
  return ['library-search', query, typeFilter] as const;
}

export function useLibrarySearchResults(submittedQuery: string, typeFilter: SearchTypeFilter) {
  const { isAuthenticated } = useAuth();
  const normalizedQuery = normalizeSearchQuery(submittedQuery);
  const enabled = isAuthenticated && isValidSearchQuery(normalizedQuery);

  return useQuery({
    queryKey: librarySearchQueryKey(normalizedQuery, typeFilter),
    queryFn: ({ signal }) => searchLibraryCatalog(normalizedQuery, typeFilter, signal),
    enabled,
    staleTime: 30_000,
  });
}
