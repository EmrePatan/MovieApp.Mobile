import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { InsightsRatingsAnalytics } from '../types';
import { formatAverageStarRating } from '../utils/insights-format';
import { InsightsEmptyState } from './InsightsEmptyState';
import { InsightsSectionHeader } from './InsightsSectionHeader';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsRatingsSectionProps {
  ratings: InsightsRatingsAnalytics;
}

export function InsightsRatingsSection({ ratings }: InsightsRatingsSectionProps) {
  const maxCount = Math.max(...ratings.distribution.map((item) => item.count), 1);
  const showMostUsed = ratings.ratingCount >= 5 && ratings.mostUsedStars != null;

  return (
    <View style={styles.section}>
      <InsightsSectionHeader title="Your Ratings" subtitle="How you score what you watch" />
      {ratings.ratingCount === 0 ? (
        <InsightsEmptyState message="No ratings yet. Rate titles to build this view." />
      ) : (
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <View>
              <AppText variant="caption" muted>Average</AppText>
              <AppText variant="title" style={styles.average}>
                {formatAverageStarRating(ratings.averageStarRating)}★
              </AppText>
            </View>
            <View>
              <AppText variant="caption" muted>Total ratings</AppText>
              <AppText variant="body" style={styles.count}>{ratings.ratingCount}</AppText>
            </View>
            {showMostUsed ? (
              <View>
                <AppText variant="caption" muted>Most used</AppText>
                <AppText variant="body" style={styles.count}>{ratings.mostUsedStars}★</AppText>
              </View>
            ) : null}
          </View>
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
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
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
});
