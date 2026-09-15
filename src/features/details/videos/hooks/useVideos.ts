import { useQuery } from '@tanstack/react-query';
import { isValidGuid } from '@/features/details/shared/routes';
import { getMovieVideos, getTvShowVideos } from '../api/videos-api';
import { movieVideosQueryKey, tvVideosQueryKey } from './videos-query-keys';

const VIDEOS_STALE_TIME_MS = 24 * 60 * 60 * 1000;

export function useMovieVideos(movieId: string) {
  return useQuery({
    queryKey: movieVideosQueryKey(movieId),
    queryFn: ({ signal }) => getMovieVideos(movieId, signal),
    enabled: isValidGuid(movieId),
    staleTime: VIDEOS_STALE_TIME_MS,
    retry: 1,
  });
}

export function useTvShowVideos(tvShowId: string) {
  return useQuery({
    queryKey: tvVideosQueryKey(tvShowId),
    queryFn: ({ signal }) => getTvShowVideos(tvShowId, signal),
    enabled: isValidGuid(tvShowId),
    staleTime: VIDEOS_STALE_TIME_MS,
    retry: 1,
  });
}
