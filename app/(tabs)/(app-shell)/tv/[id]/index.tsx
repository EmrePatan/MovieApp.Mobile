import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import { useTvShowDetails } from '@/features/details/tv/hooks/useTvShowDetails';
import { useCatalogRouteIdState } from '@/features/details/shared/hooks/useCatalogRouteId';
import { useWarmExternalRatingsDetail } from '@/features/external-ratings/hooks/useWarmExternalRatingsDetail';
import { tvShowProgressQueryKey } from '@/features/watch-history/hooks/watch-history-query-keys';

export default function TvShowDetailScreen() {
  const { t } = useTranslation();
  const { resolvedId: tvShowId, isInvalid, isDetailPathActive } = useCatalogRouteIdState();
  const queryClient = useQueryClient();
  const query = useTvShowDetails(isDetailPathActive ? tvShowId : undefined);
  useWarmExternalRatingsDetail('tv', tvShowId, isDetailPathActive);

  useFocusEffect(
    useCallback(() => {
      if (!tvShowId || !isDetailPathActive) {
        return;
      }

      const queryKey = tvShowProgressQueryKey(tvShowId);
      if (queryClient.isFetching({ queryKey }) === 0) {
        void queryClient.invalidateQueries({ queryKey });
      }
    }, [isDetailPathActive, queryClient, tvShowId]),
  );

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
