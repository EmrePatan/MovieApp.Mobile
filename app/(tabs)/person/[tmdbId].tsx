import { PersonDetailContent } from '@/features/details/person/components/PersonDetailContent';
import { usePersonDetails } from '@/features/details/person/hooks/usePersonDetails';
import { usePersonRouteTmdbId } from '@/features/details/person/hooks/usePersonRouteTmdbId';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';

export default function PersonDetailScreen() {
  const { tmdbId, isActive, isInvalid } = usePersonRouteTmdbId();
  const query = usePersonDetails(isActive ? tmdbId : null);

  return (
    <DetailQueryState
      query={query}
      invalidParamsMessage={isInvalid ? 'The person link is invalid.' : undefined}
      notFoundTitle="Person not found"
      notFoundMessage="This person could not be found."
    >
      {(person) => <PersonDetailContent person={person} />}
    </DetailQueryState>
  );
}
