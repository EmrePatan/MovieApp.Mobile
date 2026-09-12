import { useLocalSearchParams } from 'expo-router';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { TvShowDetailContent } from '@/features/details/tv/components/TvShowDetailContent';
import { useTvShowDetails } from '@/features/details/tv/hooks/useTvShowDetails';
import { isValidGuid } from '@/features/details/shared/routes';

export default function TvShowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tvShowId = typeof id === 'string' ? id : undefined;
  const query = useTvShowDetails(tvShowId);

  return (
    <DetailQueryState
      query={query}
      invalidParamsMessage={!isValidGuid(tvShowId) ? 'The TV show link is invalid.' : undefined}
      notFoundTitle="TV show not found"
      notFoundMessage="This TV show could not be found."
    >
      {(show) => <TvShowDetailContent show={show} />}
    </DetailQueryState>
  );
}
