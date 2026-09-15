import { View } from 'react-native';
import { DetailActionBar } from '../../shared/components/DetailActionBar';
import { DetailHero } from '../../shared/components/DetailHero';
import { DetailOverview } from '../../shared/components/DetailSections';
import { DetailInlineRatingSection } from '@/features/ratings/components/DetailInlineRatingSection';
import { CastRail } from '@/features/details/credits/components/CastRail';
import { WhereToWatchRail } from '@/features/details/watch-providers/components/WhereToWatchRail';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { PlayTrailerButton } from '@/features/details/videos/components/PlayTrailerButton';
import { SimilarContentSection } from '@/features/recommendations/components/SimilarContentSection';
import { CollectionLinkRow } from '@/features/details/collection/components/CollectionLinkRow';
import { CatalogGallerySection } from '@/features/gallery/components/CatalogGallerySection';
import { useMovieGallery } from '@/features/gallery/hooks/useGallery';
import { buildMovieDetailRoute, buildMovieGalleryRoute } from '@/features/details/shared/routes';
import { formatMovieDetailMetadataLine } from '../../shared/utils/format-detail-metadata';
import type { MovieDetailsResponse } from '../types';
interface MovieDetailContentProps {
  movie: MovieDetailsResponse;
}

export function MovieDetailContent({ movie }: MovieDetailContentProps) {
  const galleryQuery = useMovieGallery(movie.id);
  const metadataLine = formatMovieDetailMetadataLine({
    releaseDate: movie.releaseDate,
    runtimeMinutes: movie.runtimeMinutes,
    voteAverage: movie.voteAverage,
  });

  return (
    <View>
      <DetailHero
        title={movie.title}
        originalTitle={movie.originalTitle}
        posterPath={movie.posterPath}
        backdropPath={movie.backdropPath}
        metadataLine={metadataLine}
        genres={movie.genres}
        posterAccessibilityLabel={`${movie.title} poster`}
        identityAccessory={
          <PlayTrailerButton contentType="movie" contentId={movie.id} />
        }
      />
      <DetailActionBar
        contentType="movie"
        contentId={movie.id}
        showWatched={movie.isReleased}
        releaseDate={movie.releaseDate}
      />
      <CollectionLinkRow collection={movie.collection} />
      <DetailOverview overview={movie.overview} />
      {movie.isReleased ? (
        <DetailInlineRatingSection contentType="movie" contentId={movie.id} />
      ) : null}
      <WhereToWatchRail contentType="movie" contentId={movie.id} />
      <CatalogGallerySection
        query={galleryQuery}
        seeAllRoute={buildMovieGalleryRoute(movie.id)}
        returnHref={buildMovieDetailRoute(movie.id)}
      />
      <CastRail contentType="movie" contentId={movie.id} title={movie.title} />
      <ReviewsSection contentType="movie" contentId={movie.id} />
      <SimilarContentSection contentType="movie" contentId={movie.id} />
    </View>
  );
}
