import { useQuery } from '@tanstack/react-query';
import { getNowInTheaters } from '../api/discovery-api';
import { NOW_IN_THEATERS_PREVIEW_SIZE } from '../now-in-theaters-types';
import { nowInTheatersPreviewQueryKey } from './discovery-query-keys';

export function useNowInTheatersPreview(releaseRegion: string) {
  return useQuery({
    queryKey: nowInTheatersPreviewQueryKey(releaseRegion),
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
