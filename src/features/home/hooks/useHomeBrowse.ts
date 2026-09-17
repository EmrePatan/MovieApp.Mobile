import { useQuery } from '@tanstack/react-query';
import { getHomeBrowse } from '../api/home-api';
import type { HomeTypeFilter } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '../types';
import { HOME_QUERY_KEY_ROOT } from './home-query-keys';

export function homeBrowseQueryKey(type: HomeTypeFilter, sectionSize: number) {
  return [...HOME_QUERY_KEY_ROOT, 'browse', type, sectionSize] as const;
}

export function useHomeBrowse(type: HomeTypeFilter, sectionSize = DEFAULT_HOME_SECTION_SIZE) {
  return useQuery({
    queryKey: homeBrowseQueryKey(type, sectionSize),
    queryFn: ({ signal }) => getHomeBrowse({ type, sectionSize }, signal),
    staleTime: 60_000,
  });
}
