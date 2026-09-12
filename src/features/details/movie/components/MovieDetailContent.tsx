import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { BackdropImage, CatalogImage } from '../../shared/components/CatalogImage';
import {
  DetailExternalIds,
  DetailGenres,
  DetailMetaItem,
  DetailOverview,
} from '../../shared/components/DetailSections';
import { DetailActionsSection } from '../../shared/components/DetailActionsSection';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { SimilarContentSection } from '@/features/recommendations/components/SimilarContentSection';
import type { MovieDetailsResponse } from '../types';
import {
  formatIsoDate,
  formatRating,
  formatRuntimeMinutes,
  formatVoteCount,
  shouldShowOriginalTitle,
} from '@/utils/format';
import { spacing } from '@/theme/spacing';

interface MovieDetailContentProps {
  movie: MovieDetailsResponse;
}

export function MovieDetailContent({ movie }: MovieDetailContentProps) {
  const releaseDate = formatIsoDate(movie.releaseDate);
  const runtime = formatRuntimeMinutes(movie.runtimeMinutes);

  return (
    <View>
      <BackdropImage path={movie.backdropPath} />

      <View style={styles.headerRow}>
        <CatalogImage
          path={movie.posterPath}
          width={120}
          height={180}
          accessibilityLabel={`${movie.title} poster`}
        />
        <View style={styles.headerMeta}>
          <AppText variant="title">{movie.title}</AppText>
          {shouldShowOriginalTitle(movie.title, movie.originalTitle) ? (
            <AppText variant="bodySmall" muted>
              {movie.originalTitle}
            </AppText>
          ) : null}
          <View style={styles.metaGrid}>
            {releaseDate ? <DetailMetaItem label="Release" value={releaseDate} /> : null}
            {runtime ? <DetailMetaItem label="Runtime" value={runtime} /> : null}
            <DetailMetaItem label="TMDB Rating" value={`★ ${formatRating(movie.voteAverage)}`} />
            <DetailMetaItem label="Votes" value={formatVoteCount(movie.voteCount)} />
            {movie.originalLanguage ? (
              <DetailMetaItem label="Language" value={movie.originalLanguage.toUpperCase()} />
            ) : null}
          </View>
        </View>
      </View>

      <DetailActionsSection contentType="movie" contentId={movie.id} />
      <ReviewsSection contentType="movie" contentId={movie.id} />
      <SimilarContentSection contentType="movie" contentId={movie.id} />

      <DetailGenres genres={movie.genres} />
      <DetailOverview overview={movie.overview} />
      <DetailExternalIds
        tmdbId={movie.externalIds.tmdbId}
        tvdbId={movie.externalIds.tvdbId}
        imdbId={movie.externalIds.imdbId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: -40,
  },
  headerMeta: {
    flex: 1,
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  metaGrid: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
