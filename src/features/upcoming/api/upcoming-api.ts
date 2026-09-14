import { api } from '@/api/client';
import { buildUpcomingCatalogPath } from './routes';
import type { UpcomingCatalogRequest, UpcomingCatalogResponse } from '../types';

export async function getUpcomingCatalog(
  criteria: UpcomingCatalogRequest = {},
  signal?: AbortSignal,
): Promise<UpcomingCatalogResponse> {
  return api.get<UpcomingCatalogResponse>(buildUpcomingCatalogPath(criteria), { signal });
}
