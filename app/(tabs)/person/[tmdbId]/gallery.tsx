import { useTranslation } from 'react-i18next';
import { GalleryDetailContent } from '@/features/gallery/components/GalleryDetailContent';
import { usePersonGallery } from '@/features/gallery/hooks/useGallery';
import { usePersonRouteTmdbId } from '@/features/details/person/hooks/usePersonRouteTmdbId';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { useHideBottomNavigationBar } from '@/features/navigation/useHideBottomNavigationBar';

export default function PersonGalleryScreen() {
  const { t } = useTranslation();
  useHideBottomNavigationBar();
  const { tmdbId, isInvalid } = usePersonRouteTmdbId();
  const query = usePersonGallery(tmdbId ?? 0);

  if (!tmdbId) {
    return null;
  }

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
