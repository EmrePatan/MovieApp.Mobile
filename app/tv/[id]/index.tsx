import { useTranslation } from 'react-i18next';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import { useTvShowDetails } from '@/features/details/tv/hooks/useTvShowDetails';
import { useCatalogRouteIdState } from '@/features/details/shared/hooks/useCatalogRouteId';

export default function TvShowDetailScreen() {
  const { t } = useTranslation();
  const { resolvedId: tvShowId, isInvalid, isDetailPathActive } = useCatalogRouteIdState('tv');
  const query = useTvShowDetails(isDetailPathActive ? tvShowId : undefined);

  if (!tvShowId || !isDetailPathActive) {
    return null;
  }

  return (
    <DetailQueryState
      query={query}
      enableRatingNavigationGestureLock
      invalidParamsMessage={isInvalid ? t('details.queryState.invalidRequestMessage') : undefined}
      notFoundTitle={t('details.queryState.invalidRequestTitle')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(show) => <TvShowDetailContent show={show} />}
    </DetailQueryState>
  );
}
