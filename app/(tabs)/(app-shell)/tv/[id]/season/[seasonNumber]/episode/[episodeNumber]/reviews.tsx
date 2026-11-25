import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { useCatalogChildDestinationGestureGuard } from '@/features/details/shared/navigation/useCatalogChildDestinationGestureGuard';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { useEpisode } from '@/features/details/episode/hooks/useEpisode';
import { isValidGuid, parsePositiveInt } from '@/features/details/shared/routes';
import { ReviewsDetailContent } from '@/features/reviews/components/ReviewsDetailContent';

export default function EpisodeReviewsScreen() {
  useCatalogChildDestinationGestureGuard();
  const { t } = useTranslation();
  const {
    id,
    seasonNumber: seasonNumberParam,
    episodeNumber: episodeNumberParam,
    title: titleParam,
  } = useLocalSearchParams<{
    id: string;
    seasonNumber: string;
    episodeNumber: string;
    title?: string;
  }>();

  const tvShowId = typeof id === 'string' ? id : undefined;
  const seasonNumber = parsePositiveInt(
    typeof seasonNumberParam === 'string' ? seasonNumberParam : undefined,
  );
  const episodeNumber = parsePositiveInt(
    typeof episodeNumberParam === 'string' ? episodeNumberParam : undefined,
  );
  const routeTitle = typeof titleParam === 'string' ? titleParam : undefined;
  const query = useEpisode(tvShowId, seasonNumber, episodeNumber);

  const invalidParamsMessage =
    !isValidGuid(tvShowId) || seasonNumber == null || episodeNumber == null
      ? t('details.queryState.invalidRequestMessage')
      : undefined;

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={invalidParamsMessage}
      notFoundTitle={t('details.queryState.invalidRequestTitle')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
      invalidRequestMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(episode) => (
        <ReviewsDetailContent
          contentType="episode"
          contentId={episode.id}
          contentTitle={routeTitle ?? episode.name ?? undefined}
          posterPath={episode.stillPath}
        />
      )}
    </DetailQueryState>
  );
}
