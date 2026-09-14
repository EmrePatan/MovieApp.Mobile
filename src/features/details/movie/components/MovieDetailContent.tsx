import { View } from 'react-native';
import { DetailActionBar } from '../../shared/components/DetailActionBar';
import { DetailHero } from '../../shared/components/DetailHero';
import { DetailOverview } from '../../shared/components/DetailSections';
import { DetailInlineRatingSection } from '@/features/ratings/components/DetailInlineRatingSection';
import { CastRail } from '@/features/details/credits/components/CastRail';
import { WhereToWatchRail } from '@/features/details/watch-providers/components/WhereToWatchRail';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { SimilarContentSection } from '@/features/recommendations/components/SimilarContentSection';
import { formatMovieDetailMetadataLine } from '../../shared/utils/format-detail-metadata';
import type { MovieDetailsResponse } from '../types';
interface MovieDetailContentProps {
  movie: MovieDetailsResponse;
}

export function MovieDetailContent({ movie }: MovieDetailContentProps) {
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
      />
      <DetailActionBar contentType="movie" contentId={movie.id} showWatched />
      <DetailOverview overview={movie.overview} />
      <DetailInlineRatingSection contentType="movie" contentId={movie.id} />
      <WhereToWatchRail contentType="movie" contentId={movie.id} />
      <CastRail contentType="movie" contentId={movie.id} />
      <ReviewsSection contentType="movie" contentId={movie.id} />
      <SimilarContentSection contentType="movie" contentId={movie.id} />
    </View>
  );
}
