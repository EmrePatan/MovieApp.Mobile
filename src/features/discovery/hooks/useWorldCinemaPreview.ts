import { useQuery } from '@tanstack/react-query';
import type { AdvancedDiscoverMediaType } from '../advanced-discover-types';
import { getWorldCinema } from '../api/discovery-api';
import { DEFAULT_WORLD_CINEMA_SORT, WORLD_CINEMA_PREVIEW_SIZE } from '../world-cinema-types';
import { worldCinemaPreviewQueryKey } from './discovery-query-keys';

export function useWorldCinemaPreview(
  originCountry: string,
  mediaType: AdvancedDiscoverMediaType = 'movie',
) {
  return useQuery({
    queryKey: worldCinemaPreviewQueryKey(mediaType, originCountry),
    queryFn: ({ signal }) =>
      getWorldCinema(
        {
          mediaType,
          originCountry,
          sort: DEFAULT_WORLD_CINEMA_SORT,
          page: 1,
          pageSize: WORLD_CINEMA_PREVIEW_SIZE,
        },
        signal,
      ),
    staleTime: 120_000,
  });
}
