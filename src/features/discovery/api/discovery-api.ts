import { api } from '@/api/client';
import type { SearchResponse } from '@/features/search/types';
import { buildBrowsePath, buildGenresPath } from './routes';
import type { DiscoveryBrowseRequest, Genre } from '../types';

export async function getBrowseDiscovery(
  criteria: DiscoveryBrowseRequest,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return api.get<SearchResponse>(buildBrowsePath(criteria), {
    authenticated: false,
    signal,
  });
}

export async function getGenres(signal?: AbortSignal): Promise<Genre[]> {
  return api.get<Genre[]>(buildGenresPath(), {
    authenticated: false,
    signal,
  });
}
