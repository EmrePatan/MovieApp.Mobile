import { useTranslation } from 'react-i18next';
import { GalleryDetailContent } from '@/features/gallery/components/GalleryDetailContent';
import { usePersonGallery } from '@/features/gallery/hooks/useGallery';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { parsePositiveInt } from '@/features/details/shared/routes';
import { useLocalSearchParams } from 'expo-router';

export default function PersonGalleryScreen() {
  const { t } = useTranslation();
  const { tmdbId } = useLocalSearchParams<{ tmdbId?: string }>();
  const resolvedTmdbId = parsePositiveInt(tmdbId);
  const isInvalid = resolvedTmdbId === null;
  const query = usePersonGallery(isInvalid || resolvedTmdbId === null ? 0 : resolvedTmdbId);

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={isInvalid ? t('details.queryState.invalidRequestMessage') : undefined}
      notFoundTitle={t('details.sections.photos')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(gallery) => <GalleryDetailContent gallery={gallery} mode="person" />}
    </DetailQueryState>
  );
}
