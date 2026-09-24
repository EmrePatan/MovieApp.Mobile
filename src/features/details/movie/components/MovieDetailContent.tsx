import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { DetailActionBar } from '../../shared/components/DetailActionBar';
import { DetailHero } from '../../shared/components/DetailHero';
import { DetailOverview } from '../../shared/components/DetailSections';
import { DetailInlineRatingSection } from '@/features/ratings/components/DetailInlineRatingSection';
import { OtherRatingsSection } from '@/features/external-ratings/components/OtherRatingsSection';
import { CastRail } from '@/features/details/credits/components/CastRail';
import { WhereToWatchRail } from '@/features/details/watch-providers/components/WhereToWatchRail';
import { ReviewsLinkRow } from '@/features/reviews/components/ReviewsLinkRow';
import { PlayTrailerButton } from '@/features/details/videos/components/PlayTrailerButton';
import { SimilarContentSection } from '@/features/recommendations/components/SimilarContentSection';
import { CollectionLinkRow } from '@/features/details/collection/components/CollectionLinkRow';
import { CatalogGallerySection } from '@/features/gallery/components/CatalogGallerySection';
import { useMovieGallery } from '@/features/gallery/hooks/useGallery';
import { buildMovieGalleryRoute } from '@/features/details/shared/routes';
import { formatMovieDetailMetadataLine } from '../../shared/utils/format-detail-metadata';
import type { MovieDetailsResponse } from '../types';
interface MovieDetailContentProps {
  movie: MovieDetailsResponse;
}

export function MovieDetailContent({ movie }: MovieDetailContentProps) {
  const { t } = useTranslation();
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
        posterAccessibilityLabel={t('common.posterAccessibility', { title: movie.title })}
        identityAccessory={
          <PlayTrailerButton contentType="movie" contentId={movie.id} />
        }
      />
      <DetailActionBar
        contentType="movie"
        contentId={movie.id}
        showWatched={movie.isReleased}
        showReleaseAlert={movie.canSetReleaseAlert}
      />
      <CollectionLinkRow collection={movie.collection} />
      <DetailOverview overview={movie.overview} />
      {movie.isReleased ? (
        <DetailInlineRatingSection contentType="movie" contentId={movie.id} />
      ) : null}
      <OtherRatingsSection mediaType="movie" contentId={movie.id} />
      <ReviewsLinkRow
        contentType="movie"
        contentId={movie.id}
        contentTitle={movie.title}
      />
      <WhereToWatchRail contentType="movie" contentId={movie.id} />
      <CatalogGallerySection
        query={galleryQuery}
        seeAllRoute={buildMovieGalleryRoute(movie.id)}
      />
      <CastRail contentType="movie" contentId={movie.id} title={movie.title} />
      <SimilarContentSection contentType="movie" contentId={movie.id} />
    </View>
  );
}
