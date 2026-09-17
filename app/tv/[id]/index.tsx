import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import { useTvShowDetails } from '@/features/details/tv/hooks/useTvShowDetails';
import { useCatalogRouteIdState } from '@/features/details/shared/hooks/useCatalogRouteId';

export default function TvShowDetailScreen() {
  const { resolvedId: tvShowId, isActive, isInvalid } = useCatalogRouteIdState('tv');
  const query = useTvShowDetails(isActive ? tvShowId : undefined);

  if (!isActive) {
    return null;
  }

  return (
    <DetailQueryState
      query={query}
      enableRatingNavigationGestureLock
      invalidParamsMessage={isInvalid ? 'The TV show link is invalid.' : undefined}
      notFoundTitle="TV show not found"
      notFoundMessage="This TV show could not be found."
    >
      {(show) => <TvShowDetailContent show={show} />}
    </DetailQueryState>
  );
}
