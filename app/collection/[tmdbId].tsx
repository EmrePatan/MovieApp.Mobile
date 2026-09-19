import { useTranslation } from 'react-i18next';
import { CollectionDetailContent } from '@/features/details/collection/components/CollectionDetailContent';
import { useCollectionDetail } from '@/features/details/collection/hooks/useCollectionDetail';
import { useCollectionRouteTmdbId } from '@/features/details/collection/hooks/useCollectionRouteTmdbId';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';

export default function CollectionDetailScreen() {
  const { t } = useTranslation();
  const { tmdbId, isActive, isInvalid } = useCollectionRouteTmdbId();
  const query = useCollectionDetail(isActive ? tmdbId : null);

  return (
    <DetailQueryState
      query={query}
      invalidParamsMessage={isInvalid ? t('details.queryState.invalidRequestMessage') : undefined}
      notFoundTitle={t('details.queryState.invalidRequestTitle')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(collection) => <CollectionDetailContent collection={collection} />}
    </DetailQueryState>
  );
}
