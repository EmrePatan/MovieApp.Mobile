import { useQuery } from '@tanstack/react-query';
import { getCollectionDetails } from '../api/collection-api';
import { collectionDetailsQueryKey } from './collection-query-keys';

const COLLECTION_STALE_TIME_MS = 6 * 60 * 60 * 1000;

export function useCollectionDetail(tmdbCollectionId: number | null | undefined) {
  const enabled = typeof tmdbCollectionId === 'number' && tmdbCollectionId > 0;

  return useQuery({
    queryKey: collectionDetailsQueryKey(tmdbCollectionId ?? 0),
    queryFn: ({ signal }) => getCollectionDetails(tmdbCollectionId!, signal),
    enabled,
    staleTime: COLLECTION_STALE_TIME_MS,
    retry: 1,
  });
}
