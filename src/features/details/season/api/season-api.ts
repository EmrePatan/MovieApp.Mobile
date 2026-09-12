import { api } from '@/api/client';
import { buildSeasonPath } from '../../shared/routes';
import type { SeasonResponse } from '../types';

export async function getSeason(
  tvShowId: string,
  seasonNumber: number,
  signal?: AbortSignal,
): Promise<SeasonResponse> {
  return api.get<SeasonResponse>(buildSeasonPath(tvShowId, seasonNumber), {
    authenticated: false,
    signal,
  });
}
