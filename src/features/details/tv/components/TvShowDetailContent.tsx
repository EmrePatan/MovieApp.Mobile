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
import { CatalogGallerySection } from '@/features/gallery/components/CatalogGallerySection';
import { useTvShowGallery } from '@/features/gallery/hooks/useGallery';
import { buildTvGalleryRoute } from '@/features/details/shared/routes';
import { SeasonList } from './SeasonList';
import { formatTvDetailMetadataLine } from '../../shared/utils/format-detail-metadata';
import type { TvShowDetailsResponse } from '../types';

interface TvShowDetailContentProps {
  show: TvShowDetailsResponse;
}

export function TvShowDetailContent({ show }: TvShowDetailContentProps) {
  const { t } = useTranslation();
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
        posterAccessibilityLabel={t('common.posterAccessibility', { title: show.title })}
        identityAccessory={
          <PlayTrailerButton contentType="tv" contentId={show.id} />
        }
      />
      <DetailActionBar
        contentType="tv"
        contentId={show.id}
        showWatched
        showFollow={show.canFollow}
      />
      <DetailOverview overview={show.overview} />
      <DetailInlineRatingSection contentType="tv" contentId={show.id} />
      <OtherRatingsSection mediaType="tv" contentId={show.id} />
      <SeasonList tvShowId={show.id} seasons={show.seasons} showTitle={show.title} />
      <ReviewsLinkRow
        contentType="tv"
        contentId={show.id}
        contentTitle={show.title}
      />
      <WhereToWatchRail contentType="tv" contentId={show.id} />
      <CatalogGallerySection
        query={galleryQuery}
        seeAllRoute={buildTvGalleryRoute(show.id)}
      />
      <CastRail contentType="tv" contentId={show.id} title={show.title} />
      <SimilarContentSection contentType="tv" contentId={show.id} />
    </View>
  );
}
