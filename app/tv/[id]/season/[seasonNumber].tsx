import { useLocalSearchParams } from 'expo-router';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { SeasonDetailContent } from '@/features/details/season/components/SeasonDetailContent';
import { useSeason } from '@/features/details/season/hooks/useSeason';
import { isValidGuid, parsePositiveInt } from '@/features/details/shared/routes';

export default function SeasonDetailScreen() {
  const { id, seasonNumber: seasonNumberParam } = useLocalSearchParams<{
    id: string;
    seasonNumber: string;
  }>();

  const tvShowId = typeof id === 'string' ? id : undefined;
  const seasonNumber = parsePositiveInt(
    typeof seasonNumberParam === 'string' ? seasonNumberParam : undefined,
  );
  const query = useSeason(tvShowId, seasonNumber);

  const invalidParamsMessage =
    !isValidGuid(tvShowId) || seasonNumber == null ? 'The season link is invalid.' : undefined;

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={invalidParamsMessage}
      notFoundTitle="Season not found"
      notFoundMessage="This season could not be found."
      invalidRequestMessage="The season request is invalid."
    >
      {(season) => <SeasonDetailContent season={season} />}
    </DetailQueryState>
  );
}
