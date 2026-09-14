import { api } from '@/api/client';
import { buildFollowingCatalogPath } from './routes';
import type { FollowingCatalogRequest, FollowingCatalogResponse } from '../types';

export async function getFollowingCatalog(
  criteria: FollowingCatalogRequest = {},
  signal?: AbortSignal,
): Promise<FollowingCatalogResponse> {
  return api.get<FollowingCatalogResponse>(buildFollowingCatalogPath(criteria), { signal });
}
