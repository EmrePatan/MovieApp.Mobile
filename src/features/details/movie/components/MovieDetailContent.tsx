import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { DetailActionBar } from '../../shared/components/DetailActionBar';
import { DetailHero } from '../../shared/components/DetailHero';
import { DetailOverview } from '../../shared/components/DetailSections';
import { DetailUltraThinRatingRail } from '../../shared/components/DetailUltraThinRatingRail';
import { CastRail } from '@/features/details/credits/components/CastRail';
import { WhereToWatchRail } from '@/features/details/watch-providers/components/WhereToWatchRail';
import { ReviewsLinkRow } from '@/features/reviews/components/ReviewsLinkRow';
import { SimilarContentSection } from '@/features/recommendations/components/SimilarContentSection';
import { CollectionPartsSection } from '@/features/details/collection/components/CollectionPartsSection';
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
        trailer={{ contentType: 'movie', contentId: movie.id }}
      />
      <DetailUltraThinRatingRail
        contentType="movie"
        contentId={movie.id}
        showCommunityScore={movie.isReleased}
      />
      <DetailActionBar
        contentType="movie"
        contentId={movie.id}
        showWatched={movie.isReleased}
        showReleaseAlert={movie.canSetReleaseAlert}
      />
      <DetailOverview overview={movie.overview} />
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
      <CollectionPartsSection collection={movie.collection} />
      <SimilarContentSection contentType="movie" contentId={movie.id} />
    </View>
  );
}
