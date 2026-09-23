import { useState } from 'react';
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
  const [expanded, setExpanded] = useState(false);
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

  const toggleExpanded = () => {
    setExpanded((current) => !current);
  };

  const handleSelectStars = (stars: number) => {
    const nextStars = selectedStars === stars ? null : stars;
    onSelectStars(nextStars);
  };

  return (
    <View style={styles.wrapper} testID="reviews-rating-distribution">
      <View style={styles.summaryRow} testID="reviews-community-rating">
        <View style={styles.summaryLeft}>
          <Ionicons name="star" size={14} color={colors.accentStrong} />
          <AppText variant="bodySmall" style={styles.scoreText}>
            {scoreLabel}
          </AppText>
          <AppText variant="caption" muted style={styles.dotSeparator}>
            ·
          </AppText>
          <AppText variant="caption" muted style={styles.countText} numberOfLines={1}>
            {countLabel}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            expanded
              ? t('reviews.hideRatingDistribution')
              : t('reviews.showRatingDistribution')
          }
          accessibilityState={{ expanded }}
          onPress={toggleExpanded}
          hitSlop={4}
          style={({ pressed }) => [styles.distributionToggle, pressed && styles.pressed]}
          testID="reviews-distribution-toggle"
        >
          <AppText variant="caption" style={styles.distributionLabel}>
            {t('reviews.ratingDistribution')}
          </AppText>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-forward'}
            size={14}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      {selectedStars != null ? (
        <View style={styles.filterRow}>
          <AppText variant="caption" style={styles.filterLabel}>
            {t('reviews.activeStarFilter', { stars: selectedStars })}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('reviews.clearStarFilter', { stars: selectedStars })}
            onPress={() => onSelectStars(null)}
            hitSlop={4}
            style={({ pressed }) => [styles.clearFilterButton, pressed && styles.pressed]}
            testID="reviews-clear-star-filter"
          >
            <AppText variant="caption" style={styles.clearFilterLabel}>
              {t('common.clearFilters')}
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {expanded ? (
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
                  <Ionicons name="star" size={9} color={colors.textMuted} />
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: interaction.touchTarget,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  scoreText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dotSeparator: {
    lineHeight: 16,
  },
  countText: {
    flexShrink: 1,
    fontVariant: ['tabular-nums'],
  },
  distributionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: interaction.touchTarget,
    justifyContent: 'flex-end',
    paddingLeft: spacing.sm,
  },
  distributionLabel: {
    color: colors.textMuted,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  filterLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
  },
  clearFilterButton: {
    minHeight: interaction.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  clearFilterLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 14,
  },
  histogram: {
    gap: 3,
    paddingTop: 2,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 20,
  },
  rowDisabled: {
    opacity: 0.35,
  },
  rowPressed: {
    opacity: 0.85,
  },
  starLabel: {
    width: 20,
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
    width: 20,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    lineHeight: 12,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
