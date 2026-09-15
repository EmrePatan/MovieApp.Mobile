import { PersonFilmographyDetailContent } from '@/features/details/person/components/PersonFilmographyDetailContent';
import { usePersonDetails } from '@/features/details/person/hooks/usePersonDetails';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { parsePositiveInt } from '@/features/details/shared/routes';
import { useLocalSearchParams } from 'expo-router';

export default function PersonFilmographyScreen() {
  const { tmdbId } = useLocalSearchParams<{ tmdbId?: string }>();
  const resolvedTmdbId = parsePositiveInt(tmdbId);
  const isInvalid = resolvedTmdbId === null;
  const query = usePersonDetails(isInvalid || resolvedTmdbId === null ? 0 : resolvedTmdbId);

  return (
    <DetailQueryState
      query={query}
      contentLayout="list"
      invalidParamsMessage={isInvalid ? 'The filmography link is invalid.' : undefined}
      notFoundTitle="Filmography not found"
      notFoundMessage="Filmography could not be found for this person."
    >
      {(person) => <PersonFilmographyDetailContent person={person} />}
    </DetailQueryState>
  );
}
