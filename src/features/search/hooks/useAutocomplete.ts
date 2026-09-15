import { useQuery } from '@tanstack/react-query';
import { getAutocomplete } from '../api/search-api';
import { autocompleteQueryKey } from './search-query-keys';
import { isValidSearchQuery, normalizeSearchQuery } from '../utils/search-query';

interface UseAutocompleteOptions {
  enabled?: boolean;
}

export function useAutocomplete(
  debouncedQuery: string,
  options?: UseAutocompleteOptions,
) {
  const normalizedQuery = normalizeSearchQuery(debouncedQuery);

  return useQuery({
    queryKey: autocompleteQueryKey(normalizedQuery),
    queryFn: ({ signal }) => getAutocomplete(normalizedQuery, signal),
    enabled: (options?.enabled ?? true) && isValidSearchQuery(normalizedQuery),
    staleTime: 15_000,
  });
}
