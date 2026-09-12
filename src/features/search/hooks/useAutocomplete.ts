import { useQuery } from '@tanstack/react-query';
import { getAutocomplete } from '../api/search-api';
import { autocompleteQueryKey } from './search-query-keys';
import { isValidSearchQuery, normalizeSearchQuery } from '../utils/search-query';

export function useAutocomplete(debouncedQuery: string) {
  const normalizedQuery = normalizeSearchQuery(debouncedQuery);

  return useQuery({
    queryKey: autocompleteQueryKey(normalizedQuery),
    queryFn: ({ signal }) => getAutocomplete(normalizedQuery, signal),
    enabled: isValidSearchQuery(normalizedQuery),
    staleTime: 15_000,
  });
}
