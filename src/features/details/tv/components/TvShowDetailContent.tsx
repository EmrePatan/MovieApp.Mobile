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
import { WatchProgressSection } from '@/features/watch-history/components/WatchProgressSection';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { SimilarContentSection } from '@/features/recommendations/components/SimilarContentSection';
import { SeasonList } from './SeasonList';
import type { TvShowDetailsResponse } from '../types';
import {
  formatIsoDate,
  formatRating,
  formatVoteCount,
  shouldShowOriginalTitle,
} from '@/utils/format';
import { spacing } from '@/theme/spacing';

interface TvShowDetailContentProps {
  show: TvShowDetailsResponse;
}

export function TvShowDetailContent({ show }: TvShowDetailContentProps) {
  const firstAirDate = formatIsoDate(show.firstAirDate);
  const lastAirDate = formatIsoDate(show.lastAirDate);

  return (
    <View>
      <BackdropImage path={show.backdropPath} />

      <View style={styles.headerRow}>
        <CatalogImage
          path={show.posterPath}
          width={120}
          height={180}
          accessibilityLabel={`${show.title} poster`}
        />
        <View style={styles.headerMeta}>
          <AppText variant="title">{show.title}</AppText>
          {shouldShowOriginalTitle(show.title, show.originalTitle) ? (
            <AppText variant="bodySmall" muted>
              {show.originalTitle}
            </AppText>
          ) : null}
          <View style={styles.metaGrid}>
            {firstAirDate ? <DetailMetaItem label="First aired" value={firstAirDate} /> : null}
            {lastAirDate ? <DetailMetaItem label="Last aired" value={lastAirDate} /> : null}
            <DetailMetaItem label="Status" value={show.status} />
            <DetailMetaItem label="TMDB Rating" value={`★ ${formatRating(show.voteAverage)}`} />
            <DetailMetaItem label="Votes" value={formatVoteCount(show.voteCount)} />
            {show.originalLanguage ? (
              <DetailMetaItem label="Language" value={show.originalLanguage.toUpperCase()} />
            ) : null}
          </View>
        </View>
      </View>

      <DetailActionsSection contentType="tv" contentId={show.id} />
      <WatchProgressSection tvShowId={show.id} />
      <ReviewsSection contentType="tv" contentId={show.id} />
      <SimilarContentSection contentType="tv" contentId={show.id} />

      <DetailGenres genres={show.genres} />
      <DetailOverview overview={show.overview} />
      <SeasonList tvShowId={show.id} seasons={show.seasons} />
      <DetailExternalIds
        tmdbId={show.externalIds.tmdbId}
        tvdbId={show.externalIds.tvdbId}
        imdbId={show.externalIds.imdbId}
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
