import { useLocalSearchParams } from 'expo-router';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { EpisodeDetailContent } from '@/features/details/episode/components/EpisodeDetailContent';
import { useEpisode } from '@/features/details/episode/hooks/useEpisode';
import { isValidGuid, parsePositiveInt } from '@/features/details/shared/routes';

export default function EpisodeDetailScreen() {
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
      ? 'The episode link is invalid.'
      : undefined;

  return (
    <DetailQueryState
      query={query}
      invalidParamsMessage={invalidParamsMessage}
      notFoundTitle="Episode not found"
      notFoundMessage="This episode could not be found."
      invalidRequestMessage="The episode request is invalid."
    >
      {(episode) => <EpisodeDetailContent episode={episode} />}
    </DetailQueryState>
  );
}
