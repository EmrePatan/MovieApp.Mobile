import { useQuery } from '@tanstack/react-query';
import { getHome } from '../api/home-api';
import type { HomeTypeFilter } from '../types';
import { DEFAULT_HOME_SECTION_SIZE } from '../types';

export function homeQueryKey(type: HomeTypeFilter, sectionSize: number) {
  return ['home', type, sectionSize] as const;
}

export function useHome(type: HomeTypeFilter, sectionSize = DEFAULT_HOME_SECTION_SIZE) {
  return useQuery({
    queryKey: homeQueryKey(type, sectionSize),
    queryFn: ({ signal }) => getHome({ type, sectionSize }, signal),
    staleTime: 60_000,
  });
}
