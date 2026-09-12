import { useQuery } from '@tanstack/react-query';
import { getSimilarTvShows } from '../api/recommendations-api';
import { similarTvShowsQueryKey } from './recommendation-query-keys';
import { DEFAULT_RECOMMENDATION_PAGE_SIZE } from '../types';

export function useSimilarTvShows(tvShowId: string, pageSize = DEFAULT_RECOMMENDATION_PAGE_SIZE) {
  return useQuery({
    queryKey: similarTvShowsQueryKey(tvShowId, pageSize),
    queryFn: ({ signal }) => getSimilarTvShows(tvShowId, { page: 1, pageSize }, signal),
    enabled: tvShowId.length > 0,
    staleTime: 120_000,
  });
}
