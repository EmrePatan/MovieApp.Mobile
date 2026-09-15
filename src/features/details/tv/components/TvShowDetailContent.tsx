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
import { CatalogGallerySection } from '@/features/gallery/components/CatalogGallerySection';
import { useTvShowGallery } from '@/features/gallery/hooks/useGallery';
import { buildTvDetailRoute, buildTvGalleryRoute } from '@/features/details/shared/routes';
import { SeasonList } from './SeasonList';
import { formatTvDetailMetadataLine } from '../../shared/utils/format-detail-metadata';
import type { TvShowDetailsResponse } from '../types';

interface TvShowDetailContentProps {
  show: TvShowDetailsResponse;
}

export function TvShowDetailContent({ show }: TvShowDetailContentProps) {
  const galleryQuery = useTvShowGallery(show.id);
  const metadataLine = formatTvDetailMetadataLine({
    firstAirDate: show.firstAirDate,
    voteAverage: show.voteAverage,
    seasonCount: show.seasons.length,
  });

  return (
    <View>
      <DetailHero
        title={show.title}
        originalTitle={show.originalTitle}
        posterPath={show.posterPath}
        backdropPath={show.backdropPath}
        metadataLine={metadataLine}
        genres={show.genres}
        posterAccessibilityLabel={`${show.title} poster`}
        identityAccessory={
          <PlayTrailerButton contentType="tv" contentId={show.id} />
        }
      />
      <DetailActionBar contentType="tv" contentId={show.id} showWatched />
      <DetailOverview overview={show.overview} />
      <DetailInlineRatingSection contentType="tv" contentId={show.id} />
      <SeasonList tvShowId={show.id} seasons={show.seasons} showTitle={show.title} />
      <WhereToWatchRail contentType="tv" contentId={show.id} />
      <CatalogGallerySection
        query={galleryQuery}
        seeAllRoute={buildTvGalleryRoute(show.id)}
        returnHref={buildTvDetailRoute(show.id)}
      />
      <CastRail contentType="tv" contentId={show.id} title={show.title} />
      <ReviewsSection contentType="tv" contentId={show.id} />
      <SimilarContentSection contentType="tv" contentId={show.id} />
    </View>
  );
}
