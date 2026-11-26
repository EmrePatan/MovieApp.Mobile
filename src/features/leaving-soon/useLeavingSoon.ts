import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { DEFAULT_HOME_SECTION_SIZE } from '@/features/home/types';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { getLeavingSoon } from './leaving-soon-api';
import { DEFAULT_LEAVING_SOON_PAGE_SIZE, type LeavingSoonState } from './leaving-soon-types';

const STALE_TIME_MS = 120_000;

export function useLeavingSoonPreview(region: string, enabled: boolean) {
  return useQuery({
    queryKey: ['discovery', 'leaving-soon', 'preview', region] as const,
    enabled,
    queryFn: ({ signal }) =>
      getLeavingSoon(
        { watchRegion: region, page: 1, pageSize: DEFAULT_HOME_SECTION_SIZE },
        signal,
      ),
    staleTime: STALE_TIME_MS,
  });
}

export function useLeavingSoonList(state: LeavingSoonState) {
  const { region, isHydrated } = useRegionalPreference();

  return useInfiniteQuery({
    queryKey: ['discovery', 'leaving-soon', 'list', region, state] as const,
    enabled: isHydrated,
    queryFn: ({ pageParam, signal }) =>
      getLeavingSoon(
        {
          ...state,
          watchRegion: region,
          page: pageParam,
          pageSize: DEFAULT_LEAVING_SOON_PAGE_SIZE,
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    staleTime: STALE_TIME_MS,
  });
}
