import { api } from '@/api/client';
import { buildTvShowDetailsPath } from '../../shared/routes';
import type { TvShowDetailsResponse } from '../types';

export async function getTvShowDetails(
  id: string,
  signal?: AbortSignal,
): Promise<TvShowDetailsResponse> {
  return api.get<TvShowDetailsResponse>(buildTvShowDetailsPath(id), {
    authenticated: false,
    signal,
  });
}
