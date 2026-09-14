import { api } from '@/api/client';
import { buildPersonDetailsPath } from './routes';
import type { PersonDetailResponse } from '../types';

export async function getPersonDetails(
  tmdbId: number,
  signal?: AbortSignal,
): Promise<PersonDetailResponse> {
  return api.get<PersonDetailResponse>(buildPersonDetailsPath(tmdbId), {
    authenticated: false,
    signal,
  });
}
