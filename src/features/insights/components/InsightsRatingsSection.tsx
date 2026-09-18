import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { InsightsV3Ratings } from '../types';
import { formatAverageStarRating } from '../utils/insights-format';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface InsightsRatingsSectionProps {
  ratings: InsightsV3Ratings;
}

export function InsightsRatingsSection({ ratings }: InsightsRatingsSectionProps) {
  const maxCount = Math.max(...ratings.distribution.map((item) => item.count), 1);

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Your Ratings" subtitle="How you score what you watch" />
      {ratings.count === 0 ? (
        <InsightsEmptyState message="No ratings yet. Rate titles to build this view." />
      ) : (
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <View>
              <AppText variant="caption" muted>Average</AppText>
              <AppText variant="title" style={styles.average}>
                {formatAverageStarRating(ratings.averageStars)}★
              </AppText>
            </View>
            <View>
              <AppText variant="caption" muted>Total ratings</AppText>
              <AppText variant="body" style={styles.count}>{ratings.count}</AppText>
            </View>
          </View>
          {ratings.distribution.length > 0 ? (
            <View style={styles.distribution}>
              {ratings.distribution.map((item) => {
                const widthPercent = Math.max(6, (item.count / maxCount) * 100);
                return (
                  <View
                    key={item.stars}
                    style={styles.distributionRow}
                    accessibilityRole="text"
                    accessibilityLabel={`${item.stars} stars, ${item.count} ratings`}
                  >
                    <AppText variant="caption" style={styles.starLabel}>{item.stars}★</AppText>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${widthPercent}%` }]} />
                    </View>
                    <AppText variant="caption" muted style={styles.countLabel}>
                      {item.count}
                    </AppText>
                  </View>
                );
              })}
            </View>
          ) : null}
          {ratings.highestRatedGenre || ratings.lowestRatedGenre ? (
            <View style={styles.genreRow}>
              {ratings.highestRatedGenre ? (
                <GenreHighlight
                  label="Highest genre"
                  name={ratings.highestRatedGenre.name}
                  stars={ratings.highestRatedGenre.averageStars}
                />
              ) : null}
              {ratings.lowestRatedGenre ? (
                <GenreHighlight
                  label="Lowest genre"
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

function GenreHighlight({
  label,
  name,
  stars,
}: {
  label: string;
  name: string;
  stars: number;
}) {
  return (
    <View style={styles.genreHighlight}>
      <AppText variant="caption" muted>{label}</AppText>
      <AppText variant="bodySmall" style={styles.genreName}>{name}</AppText>
      <AppText variant="caption" muted>{formatAverageStarRating(stars)}★</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  average: {
    color: colors.accent,
  },
  count: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  distribution: {
    gap: spacing.sm,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  starLabel: {
    width: 28,
    color: colors.textPrimary,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
  countLabel: {
    width: 24,
    textAlign: 'right',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  genreHighlight: {
    gap: 2,
    minWidth: 120,
  },
  genreName: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
