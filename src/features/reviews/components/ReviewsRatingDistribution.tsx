import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import {
  formatCommunityRatingCountLabel,
  formatCommunityStarRatingDisplay,
} from '@/features/ratings/utils/star-rating';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import { RATING_STAR_COUNT } from '../utils/rating-star-buckets';

interface ReviewsRatingDistributionProps {
  buckets: Record<number, number>;
  selectedStars: number | null;
  onSelectStars: (stars: number | null) => void;
  averageScore: number;
  ratingCount: number;
}

export function ReviewsRatingDistribution({
  buckets,
  selectedStars,
  onSelectStars,
  averageScore,
  ratingCount,
}: ReviewsRatingDistributionProps) {
  const { t } = useTranslation();
  const maxCount = Math.max(...Object.values(buckets), 1);
  const scoreLabel = formatCommunityStarRatingDisplay(averageScore);
  const countLabel = formatCommunityRatingCountLabel(ratingCount);

  if (ratingCount === 0) {
    return null;
  }

  const starsDescending = Array.from(
    { length: RATING_STAR_COUNT },
    (_, index) => RATING_STAR_COUNT - index,
  );

  const handleSelectStars = (stars: number) => {
    onSelectStars(selectedStars === stars ? null : stars);
  };

  return (
    <View style={styles.wrapper} testID="reviews-rating-distribution">
      <View style={styles.distributionRow} testID="reviews-community-rating">
        <View style={styles.scoreColumn}>
          <View style={styles.scoreRow}>
            <Ionicons name="star" size={14} color={colors.accentStrong} />
            <AppText style={styles.scoreValue}>{scoreLabel}</AppText>
          </View>
          <AppText variant="caption" muted style={styles.countLabel} numberOfLines={2}>
            {countLabel}
          </AppText>
          {selectedStars != null ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('reviews.clearStarFilter', { stars: selectedStars })}
              onPress={() => onSelectStars(null)}
              hitSlop={4}
              style={({ pressed }) => [styles.clearFilterButton, pressed && styles.pressed]}
              testID="reviews-clear-star-filter"
            >
              <AppText variant="caption" style={styles.filterLabel}>
                {t('reviews.activeStarFilter', { stars: selectedStars })}
              </AppText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.histogram} testID="reviews-rating-histogram">
          {starsDescending.map((stars) => {
            const count = buckets[stars] ?? 0;
            const selected = selectedStars === stars;
            const widthPercent = count === 0 ? 0 : Math.max((count / maxCount) * 100, 8);

            return (
              <Pressable
                key={stars}
                accessibilityRole="button"
                accessibilityLabel={t('reviews.filterStarReviews', {
                  stars,
                  count,
                })}
                accessibilityState={{ selected }}
                disabled={count === 0}
                onPress={() => handleSelectStars(stars)}
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
                  <Ionicons name="star" size={8} color={colors.textMuted} />
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
                <AppText variant="caption" muted style={styles.barCount}>
                  {count}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  scoreColumn: {
    width: 72,
    gap: 2,
    paddingTop: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreValue: {
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  countLabel: {
    fontVariant: ['tabular-nums'],
    fontSize: 11,
    lineHeight: 14,
  },
  clearFilterButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
    minHeight: 28,
    justifyContent: 'center',
  },
  filterLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 13,
  },
  histogram: {
    flex: 1,
    gap: 2,
    minWidth: 0,
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 16,
  },
  rowDisabled: {
    opacity: 0.35,
  },
  rowPressed: {
    opacity: 0.85,
  },
  starLabel: {
    width: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 1,
  },
  starText: {
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 12,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint14,
  },
  fillSelected: {
    backgroundColor: colors.accent,
  },
  barCount: {
    width: 18,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    lineHeight: 12,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
