import { useQuery } from '@tanstack/react-query';
import { getHome } from '../api/home-api';
import type { HomeTypeFilter } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '../types';
import { HOME_QUERY_KEY_ROOT } from './home-query-keys';

export function homeQueryKey(type: HomeTypeFilter, sectionSize: number) {
  return [...HOME_QUERY_KEY_ROOT, type, sectionSize] as const;
}

export function useHome(type: HomeTypeFilter, sectionSize = DEFAULT_HOME_SECTION_SIZE) {
  return useQuery({
    queryKey: homeQueryKey(type, sectionSize),
    queryFn: ({ signal }) => getHome({ type, sectionSize }, signal),
    staleTime: 60_000,
  });
}
