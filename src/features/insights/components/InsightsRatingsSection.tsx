import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3Ratings } from '../types';
import { formatAverageStarRating } from '../utils/insights-format';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsRatingsSectionProps {
  ratings: InsightsV3Ratings;
}

export function InsightsRatingsSection({ ratings }: InsightsRatingsSectionProps) {
  const maxCount = Math.max(...ratings.distribution.map((item) => item.count), 1);
  const sortedDistribution = [...ratings.distribution].sort((a, b) => a.stars - b.stars);

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Your Ratings" subtitle="How you score what you watch" />
      {ratings.count === 0 ? (
        <InsightsEmptyState message="No ratings yet. Rate titles to build this view." />
      ) : (
        <View style={styles.card}>
          <View style={styles.heroRow}>
            <AppText variant="hero" style={styles.average}>
              {formatAverageStarRating(ratings.averageStars)}
            </AppText>
            <StarRow rating={ratings.averageStars ?? 0} />
          </View>

          {sortedDistribution.length > 0 ? (
            <View style={styles.distribution} accessibilityRole="summary">
              {sortedDistribution.map((item) => {
                const heightPercent = Math.max(10, (item.count / maxCount) * 100);
                return (
                  <View
                    key={item.stars}
                    style={styles.distributionColumn}
                    accessibilityRole="text"
                    accessibilityLabel={`${item.stars} stars, ${item.count} ratings`}
                  >
                    <View style={styles.distributionTrack}>
                      <View style={[styles.distributionFill, { height: `${heightPercent}%` }]} />
                    </View>
                    <AppText variant="caption" muted style={styles.starLabel}>
                      {item.stars}
                    </AppText>
                  </View>
                );
              })}
            </View>
          ) : null}

          <AppText variant="caption" style={styles.ratingCount}>{ratings.count} ratings</AppText>

          {ratings.highestRatedGenre || ratings.lowestRatedGenre ? (
            <View style={styles.genreInsights}>
              {ratings.highestRatedGenre ? (
                <GenreInsight
                  label="Highest rated"
                  name={ratings.highestRatedGenre.name}
                  stars={ratings.highestRatedGenre.averageStars}
                />
              ) : null}
              {ratings.lowestRatedGenre ? (
                <GenreInsight
                  label="Lowest rated"
                  name={ratings.lowestRatedGenre.name}
                  stars={ratings.lowestRatedGenre.averageStars}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

function StarRow({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const roundUp = rating - fullStars >= 0.75;

  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= fullStars || (roundUp && star === fullStars + 1);
        const half = hasHalf && star === fullStars + 1;
        const iconName = filled ? 'star' : half ? 'star-half' : 'star-outline';
        return (
          <Ionicons
            key={star}
            name={iconName}
            size={18}
            color={colors.accent}
          />
        );
      })}
    </View>
  );
}

function GenreInsight({
  label,
  name,
  stars,
}: {
  label: string;
  name: string;
  stars: number;
}) {
  return (
    <View style={styles.genreInsight} accessibilityRole="text">
      <AppText variant="caption" muted style={styles.genreInsightLabel}>
        {label}
      </AppText>
      <View style={styles.genreInsightRow}>
        <AppText variant="bodySmall" style={styles.genreName}>{name}</AppText>
        <AppText variant="bodySmall" style={styles.genreStars}>
          {formatAverageStarRating(stars)} ★
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  card: {
    gap: spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  average: {
    color: colors.accentStrong,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  ratingCount: {
    color: colors.textMuted,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
    paddingTop: spacing.xs,
  },
  distribution: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
    minHeight: 104,
    paddingTop: spacing.xs,
  },
  distributionColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  distributionTrack: {
    width: '100%',
    height: 80,
    justifyContent: 'flex-end',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  distributionFill: {
    width: '100%',
    backgroundColor: colors.accent,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  starLabel: {
    fontVariant: ['tabular-nums'],
  },
  genreInsights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  genreInsight: {
    gap: 4,
    minWidth: 132,
  },
  genreInsightLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 10,
    color: colors.textMuted,
  },
  genreInsightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  genreName: {
    color: colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
  },
  genreStars: {
    color: colors.accentStrong,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
