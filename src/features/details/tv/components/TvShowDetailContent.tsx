import { View } from 'react-native';
import { DetailActionBar } from '../../shared/components/DetailActionBar';
import { DetailHero } from '../../shared/components/DetailHero';
import { DetailOverview } from '../../shared/components/DetailSections';
import { DetailInlineRatingSection } from '@/features/ratings/components/DetailInlineRatingSection';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { SimilarContentSection } from '@/features/recommendations/components/SimilarContentSection';
import { SeasonList } from './SeasonList';
import { formatTvDetailMetadataLine } from '../../shared/utils/format-detail-metadata';
import type { TvShowDetailsResponse } from '../types';

interface TvShowDetailContentProps {
  show: TvShowDetailsResponse;
}

export function TvShowDetailContent({ show }: TvShowDetailContentProps) {
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
      />
      <DetailActionBar contentType="tv" contentId={show.id} />
      <DetailOverview overview={show.overview} />
      <DetailInlineRatingSection contentType="tv" contentId={show.id} />
      <SeasonList tvShowId={show.id} seasons={show.seasons} showTitle={show.title} />
      <ReviewsSection contentType="tv" contentId={show.id} />
      <SimilarContentSection contentType="tv" contentId={show.id} />
    </View>
  );
}
