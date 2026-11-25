import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { EpisodeDetailContent } from '@/features/details/episode/components/EpisodeDetailContent';
import { useEpisode } from '@/features/details/episode/hooks/useEpisode';
import { isValidGuid, parsePositiveInt } from '@/features/details/shared/routes';

export default function EpisodeDetailScreen() {
  const { t } = useTranslation();
  const { id, seasonNumber: seasonNumberParam, episodeNumber: episodeNumberParam } =
    useLocalSearchParams<{
      id: string;
      seasonNumber: string;
      episodeNumber: string;
    }>();

  const tvShowId = typeof id === 'string' ? id : undefined;
  const seasonNumber = parsePositiveInt(
    typeof seasonNumberParam === 'string' ? seasonNumberParam : undefined,
  );
  const episodeNumber = parsePositiveInt(
    typeof episodeNumberParam === 'string' ? episodeNumberParam : undefined,
  );
  const query = useEpisode(tvShowId, seasonNumber, episodeNumber);

  const invalidParamsMessage =
    !isValidGuid(tvShowId) || seasonNumber == null || episodeNumber == null
      ? t('details.queryState.invalidRequestMessage')
      : undefined;

  return (
    <DetailQueryState
      query={query}
      invalidParamsMessage={invalidParamsMessage}
      notFoundTitle={t('details.queryState.invalidRequestTitle')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
      invalidRequestMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(episode) => <EpisodeDetailContent episode={episode} />}
    </DetailQueryState>
  );
}
