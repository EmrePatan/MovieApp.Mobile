import { useQuery } from '@tanstack/react-query';
import { getEpisode } from '../api/episode-api';
import { isValidGuid } from '../../shared/routes';

export function episodeQueryKey(
  tvShowId: string,
  seasonNumber: number,
  episodeNumber: number,
) {
  return ['episode', tvShowId, seasonNumber, episodeNumber] as const;
}

export function useEpisode(
  tvShowId: string | undefined,
  seasonNumber: number | null,
  episodeNumber: number | null,
) {
  const enabled =
    isValidGuid(tvShowId) &&
    seasonNumber != null &&
    seasonNumber >= 1 &&
    episodeNumber != null &&
    episodeNumber >= 1;

  return useQuery({
    queryKey: episodeQueryKey(tvShowId ?? '', seasonNumber ?? 0, episodeNumber ?? 0),
    queryFn: ({ signal }) => getEpisode(tvShowId!, seasonNumber!, episodeNumber!, signal),
    enabled,
    staleTime: 60_000,
  });
}
