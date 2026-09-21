import { useTranslation } from 'react-i18next';
import { useCatalogChildDestinationGestureGuard } from '@/features/details/shared/navigation/useCatalogChildDestinationGestureGuard';
import { GalleryDetailContent } from '@/features/gallery/components/GalleryDetailContent';
import { useMovieGallery } from '@/features/gallery/hooks/useGallery';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { isValidGuid, normalizeRouteIdParam } from '@/features/details/shared/routes';
import { useLocalSearchParams } from 'expo-router';

export default function MovieGalleryScreen() {
  const { t } = useTranslation();
  useCatalogChildDestinationGestureGuard();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const resolvedId = normalizeRouteIdParam(id);
  const isInvalid = !isValidGuid(resolvedId);
  const query = useMovieGallery(isInvalid || !resolvedId ? '' : resolvedId);

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={isInvalid ? t('details.queryState.invalidRequestMessage') : undefined}
      notFoundTitle={t('details.queryState.invalidRequestTitle')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(gallery) => <GalleryDetailContent gallery={gallery} mode="catalog" />}
    </DetailQueryState>
  );
}
