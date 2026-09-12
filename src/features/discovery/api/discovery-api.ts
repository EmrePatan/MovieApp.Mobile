import { api } from '@/api/client';
import type { SearchResponse } from '@/features/search/types';
import { buildPopularPath, buildTrendingPath } from './routes';
import type { DiscoveryRequest } from '../types';

export async function getPopularDiscovery(
  criteria: DiscoveryRequest = {},
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return api.get<SearchResponse>(buildPopularPath(criteria), {
    authenticated: false,
    signal,
  });
}

export async function getTrendingDiscovery(
  criteria: DiscoveryRequest = {},
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return api.get<SearchResponse>(buildTrendingPath(criteria), {
    authenticated: false,
    signal,
  });
}
