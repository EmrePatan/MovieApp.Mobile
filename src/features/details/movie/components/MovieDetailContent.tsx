import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { DetailActionBar } from '../../shared/components/DetailActionBar';
import { DetailHeaderStack } from '../../shared/components/DetailHeaderStack';
import { DetailHero } from '../../shared/components/DetailHero';
import { DetailKeywords, DetailOverview } from '../../shared/components/DetailSections';
import { DetailUltraThinRatingRail } from '../../shared/components/DetailUltraThinRatingRail';
import {
  DetailPersonalRatingProvider,
} from '../../shared/components/DetailPersonalRatingExperience';
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
      <DetailHeaderStack>
      <DetailHero
        title={movie.title}
        originalTitle={movie.originalTitle}
        posterPath={movie.posterPath}
        backdropPath={movie.backdropPath}
        metadataLine={metadataLine}
        genres={movie.genres}
        posterAccessibilityLabel={t('common.posterAccessibility', { title: movie.title })}
        trailer={{ contentType: 'movie', contentId: movie.id }}
        share={{
          contentType: 'movie',
          contentId: movie.id,
          releaseDate: movie.releaseDate,
        }}
      />
      <DetailUltraThinRatingRail
        contentType="movie"
        contentId={movie.id}
        showCommunityScore={movie.isReleased}
        catalogTmdbVoteAverage={movie.voteAverage}
        contentTitle={movie.title}
      />
      <DetailPersonalRatingProvider
        contentType="movie"
        contentId={movie.id}
        watchEligible={movie.isReleased}
      >
        <DetailActionBar
          contentType="movie"
          contentId={movie.id}
          showWatched={movie.isReleased}
          showReleaseAlert={movie.canSetReleaseAlert}
          watchEligible={movie.isReleased}
          showPersonalRatingRow
        />
      </DetailPersonalRatingProvider>
      </DetailHeaderStack>
      <DetailOverview overview={movie.overview} compactTop />
      <DetailKeywords keywords={movie.keywords} />
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
