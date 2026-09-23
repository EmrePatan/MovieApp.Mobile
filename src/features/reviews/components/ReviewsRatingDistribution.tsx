import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import {
  backendScoreToStarRating,
  formatCommunityRatingCountLabel,
  formatCommunityStarRatingDisplay,
} from '@/features/ratings/utils/star-rating';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import { RATING_STAR_COUNT } from '../utils/rating-star-buckets';
import { ReviewStarRow } from './ReviewStarRow';

interface ReviewsRatingDistributionProps {
  buckets: Record<number, number>;
  selectedStars: number | null;
  onSelectStars: (stars: number | null) => void;
  averageScore: number;
  ratingCount: number;
}

const BAR_HEIGHT = 52;

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
  const averageStars = backendScoreToStarRating(averageScore);

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
      <AppText variant="caption" style={styles.sectionLabel}>
        {t('reviews.ratingsSectionLabel')} ({ratingCount})
      </AppText>

      <View style={styles.distributionRow} testID="reviews-community-rating">
        <View style={styles.histogram} testID="reviews-rating-histogram">
          {starsDescending.map((stars) => {
            const count = buckets[stars] ?? 0;
            const selected = selectedStars === stars;
            const heightPercent =
              count === 0 ? 0 : Math.max((count / maxCount) * 100, 10);

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
                  styles.column,
                  count === 0 && styles.columnDisabled,
                  pressed && count > 0 && styles.columnPressed,
                ]}
                testID={`reviews-rating-bar-${stars}`}
              >
                <View style={styles.columnTrack}>
                  <View
                    style={[
                      styles.columnFill,
                      { height: `${heightPercent}%` },
                      selected && styles.columnFillSelected,
                    ]}
                  />
                </View>
                <AppText
                  variant="caption"
                  style={[styles.columnStar, selected && styles.columnStarSelected]}
                >
                  {stars}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.scoreColumn}>
          <AppText style={styles.scoreValue}>{scoreLabel}</AppText>
          <ReviewStarRow starRating={averageStars} size={14} />
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
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  histogram: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    minWidth: 0,
    height: BAR_HEIGHT + 18,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  columnDisabled: {
    opacity: 0.35,
  },
  columnPressed: {
    opacity: 0.85,
  },
  columnTrack: {
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  columnFill: {
    width: '100%',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent,
    minHeight: 0,
  },
  columnFillSelected: {
    backgroundColor: colors.accentStrong,
  },
  columnStar: {
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 12,
  },
  columnStarSelected: {
    color: colors.accentStrong,
  },
  scoreColumn: {
    width: 72,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  scoreValue: {
    color: colors.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.4,
  },
  countLabel: {
    fontVariant: ['tabular-nums'],
    fontSize: 11,
    lineHeight: 14,
  },
  clearFilterButton: {
    alignSelf: 'center',
    marginTop: 2,
    minHeight: 24,
    justifyContent: 'center',
  },
  filterLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
