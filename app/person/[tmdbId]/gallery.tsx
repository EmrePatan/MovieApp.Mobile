import { GalleryDetailContent } from '@/features/gallery/components/GalleryDetailContent';
import { usePersonGallery } from '@/features/gallery/hooks/useGallery';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { parsePositiveInt } from '@/features/details/shared/routes';
import { useLocalSearchParams } from 'expo-router';

export default function PersonGalleryScreen() {
  const { tmdbId } = useLocalSearchParams<{ tmdbId?: string }>();
  const resolvedTmdbId = parsePositiveInt(tmdbId);
  const isInvalid = resolvedTmdbId === null;
  const query = usePersonGallery(isInvalid || resolvedTmdbId === null ? 0 : resolvedTmdbId);

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={isInvalid ? 'The gallery link is invalid.' : undefined}
      notFoundTitle="Photos not found"
      notFoundMessage="Profile photos could not be found for this person."
    >
      {(gallery) => <GalleryDetailContent gallery={gallery} mode="person" />}
    </DetailQueryState>
  );
}
