import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { useMovieDetails } from '@/features/details/movie/hooks/useMovieDetails';
import { useCatalogRouteIdState } from '@/features/details/shared/hooks/useCatalogRouteId';

export default function MovieDetailScreen() {
  const { resolvedId: movieId, isActive, isInvalid } = useCatalogRouteIdState('movie');
  const query = useMovieDetails(isActive ? movieId : undefined);

  if (!isActive) {
    return null;
  }

  return (
    <DetailQueryState
      query={query}
      invalidParamsMessage={isInvalid ? 'The movie link is invalid.' : undefined}
      notFoundTitle="Movie not found"
      notFoundMessage="This movie could not be found."
    >
      {(movie) => <MovieDetailContent movie={movie} />}
    </DetailQueryState>
  );
}
