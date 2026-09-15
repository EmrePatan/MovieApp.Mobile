import { api } from '@/api/client';
import { buildCollectionDetailsPath } from './routes';
import type { CollectionDetailResponse } from '../types';

export async function getCollectionDetails(
  tmdbCollectionId: number,
  signal?: AbortSignal,
): Promise<CollectionDetailResponse> {
  return api.get<CollectionDetailResponse>(buildCollectionDetailsPath(tmdbCollectionId), {
    authenticated: false,
    signal,
  });
}
