import { GalleryDetailContent } from '@/features/gallery/components/GalleryDetailContent';
import { useTvShowGallery } from '@/features/gallery/hooks/useGallery';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { isValidGuid, normalizeRouteIdParam } from '@/features/details/shared/routes';
import { useLocalSearchParams } from 'expo-router';

export default function TvGalleryScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const resolvedId = normalizeRouteIdParam(id);
  const isInvalid = !isValidGuid(resolvedId);
  const query = useTvShowGallery(isInvalid || !resolvedId ? '' : resolvedId);

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={isInvalid ? 'The gallery link is invalid.' : undefined}
      notFoundTitle="Gallery not found"
      notFoundMessage="Photos could not be found for this TV show."
    >
      {(gallery) => <GalleryDetailContent gallery={gallery} mode="catalog" />}
    </DetailQueryState>
  );
}
