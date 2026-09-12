import { api } from '@/api/client';
import { buildEpisodePath } from '../../shared/routes';
import type { EpisodeResponse } from '../types';

export async function getEpisode(
  tvShowId: string,
  seasonNumber: number,
  episodeNumber: number,
  signal?: AbortSignal,
): Promise<EpisodeResponse> {
  return api.get<EpisodeResponse>(
    buildEpisodePath(tvShowId, seasonNumber, episodeNumber),
    {
      authenticated: false,
      signal,
    },
  );
}
