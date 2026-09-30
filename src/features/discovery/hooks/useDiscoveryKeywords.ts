import { useQuery } from '@tanstack/react-query';
import { getDiscoveryKeywords } from '../api/discovery-api';
import { discoveryKeywordsQueryKey } from './discovery-query-keys';

const KEYWORDS_PAGE_SIZE = 30;

export function useDiscoveryKeywords(query: string, enabled = true) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: discoveryKeywordsQueryKey(trimmed, KEYWORDS_PAGE_SIZE),
    enabled: enabled && trimmed.length > 0,
    queryFn: ({ signal }) =>
      getDiscoveryKeywords(
        {
          query: trimmed,
          page: 1,
          pageSize: KEYWORDS_PAGE_SIZE,
        },
        signal,
      ),
    staleTime: 60_000,
  });
}
