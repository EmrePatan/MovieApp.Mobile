import { CollectionDetailContent } from '@/features/details/collection/components/CollectionDetailContent';
import { useCollectionDetail } from '@/features/details/collection/hooks/useCollectionDetail';
import { useCollectionRouteTmdbId } from '@/features/details/collection/hooks/useCollectionRouteTmdbId';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';

export default function CollectionDetailScreen() {
  const { tmdbId, isActive, isInvalid } = useCollectionRouteTmdbId();
  const query = useCollectionDetail(isActive ? tmdbId : null);

  return (
    <DetailQueryState
      query={query}
      invalidParamsMessage={isInvalid ? 'The collection link is invalid.' : undefined}
      notFoundTitle="Collection not found"
      notFoundMessage="This collection could not be found."
    >
      {(collection) => <CollectionDetailContent collection={collection} />}
    </DetailQueryState>
  );
}
