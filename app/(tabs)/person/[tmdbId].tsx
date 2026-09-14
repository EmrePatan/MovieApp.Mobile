import { useLocalSearchParams } from 'expo-router';
import { PersonDetailContent } from '@/features/details/person/components/PersonDetailContent';
import { usePersonDetails } from '@/features/details/person/hooks/usePersonDetails';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { normalizeRouteIdParam, parsePositiveInt } from '@/features/details/shared/routes';

export default function PersonDetailScreen() {
  const { tmdbId: rawTmdbId } = useLocalSearchParams<{ tmdbId?: string }>();
  const tmdbId = parsePositiveInt(normalizeRouteIdParam(rawTmdbId));
  const query = usePersonDetails(tmdbId);

  return (
    <DetailQueryState
      query={query}
      invalidParamsMessage={tmdbId == null ? 'The person link is invalid.' : undefined}
      notFoundTitle="Person not found"
      notFoundMessage="This person could not be found."
    >
      {(person) => <PersonDetailContent person={person} />}
    </DetailQueryState>
  );
}
