import { useQuery } from '@tanstack/react-query';
import { getNowInTheaters } from '../api/discovery-api';
import { NOW_IN_THEATERS_PREVIEW_SIZE } from '../now-in-theaters-types';
import { nowInTheatersPreviewQueryKey } from './discovery-query-keys';

export function useNowInTheatersPreview(releaseRegion: string, enabled = true) {
  return useQuery({
    queryKey: nowInTheatersPreviewQueryKey(releaseRegion),
    enabled,
    queryFn: ({ signal }) =>
      getNowInTheaters(
        {
          releaseRegion,
          page: 1,
          pageSize: NOW_IN_THEATERS_PREVIEW_SIZE,
        },
        signal,
      ),
    staleTime: 120_000,
  });
}
