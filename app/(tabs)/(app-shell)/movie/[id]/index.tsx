import { useTranslation } from 'react-i18next';
import { DetailQueryState } from '@/features/details/shared/components/DetailQueryState';
import { MovieDetailContent } from '@/features/details/movie/components/MovieDetailContent';
import { useMovieDetails } from '@/features/details/movie/hooks/useMovieDetails';
import { useCatalogRouteIdState } from '@/features/details/shared/hooks/useCatalogRouteId';

export default function MovieDetailScreen() {
  const { t } = useTranslation();
  const { resolvedId: movieId, isInvalid, isDetailPathActive } = useCatalogRouteIdState();
  const query = useMovieDetails(isDetailPathActive ? movieId : undefined);

  if (!movieId || !isDetailPathActive) {
    return null;
  }

  return (
    <DetailQueryState
      query={query}
      enableRatingNavigationGestureLock
      invalidParamsMessage={isInvalid ? t('details.queryState.invalidRequestMessage') : undefined}
      notFoundTitle={t('details.queryState.invalidRequestTitle')}
      notFoundMessage={t('details.queryState.invalidRequestMessage')}
    >
      {(movie) => <MovieDetailContent movie={movie} />}
    </DetailQueryState>
  );
}
