import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { RATING_STAR_COUNT } from '../utils/rating-star-buckets';

interface ReviewsRatingDistributionProps {
  buckets: Record<number, number>;
  selectedStars: number | null;
  onSelectStars: (stars: number | null) => void;
}

export function ReviewsRatingDistribution({
  buckets,
  selectedStars,
  onSelectStars,
}: ReviewsRatingDistributionProps) {
  const maxCount = Math.max(...Object.values(buckets), 1);
  const totalRatings = Object.values(buckets).reduce((sum, count) => sum + count, 0);

  if (totalRatings === 0) {
    return null;
  }

  const starsDescending = Array.from(
    { length: RATING_STAR_COUNT },
    (_, index) => RATING_STAR_COUNT - index,
  );

  return (
    <View style={styles.wrapper} testID="reviews-rating-distribution">
      <View style={styles.headerRow}>
        <AppText variant="caption" muted>
          Ratings
        </AppText>
        {selectedStars !== null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear rating filter"
            onPress={() => onSelectStars(null)}
            hitSlop={8}
            testID="reviews-rating-filter-clear"
          >
            <AppText variant="caption" style={styles.clearLabel}>
              Clear filter
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.rows}>
        {starsDescending.map((stars) => {
          const count = buckets[stars] ?? 0;
          const selected = selectedStars === stars;
          const widthPercent = count === 0 ? 0 : Math.max((count / maxCount) * 100, 8);

          return (
            <Pressable
              key={stars}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${stars} star reviews, ${count} ratings`}
              accessibilityState={{ selected }}
              disabled={count === 0}
              onPress={() => onSelectStars(selected ? null : stars)}
              style={({ pressed }) => [
                styles.row,
                count === 0 && styles.rowDisabled,
                pressed && count > 0 && styles.rowPressed,
              ]}
              testID={`reviews-rating-bar-${stars}`}
            >
              <View style={styles.starLabel}>
                <AppText variant="caption" style={styles.starText}>
                  {stars}
                </AppText>
                <Ionicons name="star" size={11} color={colors.accent} />
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    { width: `${widthPercent}%` },
                    selected && styles.fillSelected,
                  ]}
                />
              </View>
              <AppText variant="caption" muted style={styles.count}>
                {count}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  rows: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 28,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  rowPressed: {
    opacity: 0.85,
  },
  starLabel: {
    width: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  starText: {
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint18,
  },
  fillSelected: {
    backgroundColor: colors.accent,
  },
  count: {
    width: 28,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
