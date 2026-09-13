import { useLocalSearchParams } from 'expo-router';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { useMovieDetails } from '@/features/details/movie/hooks/useMovieDetails';
import { isValidGuid } from '@/features/details/shared/routes';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const movieId = typeof id === 'string' ? id : undefined;
  const query = useMovieDetails(movieId);

  return (
    <DetailQueryState
      query={query}
      invalidParamsMessage={!isValidGuid(movieId) ? 'The movie link is invalid.' : undefined}
      notFoundTitle="Movie not found"
      notFoundMessage="This movie could not be found."
    >
      {(movie) => <MovieDetailContent movie={movie} />}
    </DetailQueryState>
  );
}
