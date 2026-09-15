import { useQuery } from '@tanstack/react-query';
import { getOnTvThisWeek } from '../api/discovery-api';
import { ON_TV_THIS_WEEK_PREVIEW_SIZE } from '../on-tv-this-week-types';
import { onTvThisWeekPreviewQueryKey } from './discovery-query-keys';

export function useOnTvThisWeekPreview() {
  return useQuery({
    queryKey: onTvThisWeekPreviewQueryKey(),
    queryFn: ({ signal }) =>
      getOnTvThisWeek(
        {
          page: 1,
          pageSize: ON_TV_THIS_WEEK_PREVIEW_SIZE,
        },
        signal,
      ),
    staleTime: 120_000,
  });
}
