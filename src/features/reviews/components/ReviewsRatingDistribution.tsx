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

  if (ratingCount === 0) {
    return null;
  }

  const starsDescending = Array.from(
    { length: RATING_STAR_COUNT },
    (_, index) => RATING_STAR_COUNT - index,
  );

  return (
    <View style={styles.wrapper} testID="reviews-rating-distribution">
      <View style={styles.mainRow}>
        <View style={styles.scoreBlock} testID="reviews-community-rating">
          <AppText variant="caption" style={styles.communityLabel}>
            Community
          </AppText>
          <View style={styles.scoreRow}>
            <Ionicons name="star" size={18} color={colors.accentStrong} />
            <AppText style={styles.scoreValue}>
              {formatCommunityStarRatingDisplay(averageScore)}
            </AppText>
            <AppText variant="caption" muted style={styles.scoreOutOf}>
              / 5
            </AppText>
          </View>
          <AppText variant="caption" muted style={styles.countLabel}>
            {formatCommunityRatingCountLabel(ratingCount)}
          </AppText>
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
                accessibilityLabel={t('reviews.filterStarReviews', {
                  stars,
                  count,
                })}
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
                <AppText variant="caption" muted style={styles.count}>
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
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scoreBlock: {
    minWidth: 88,
    gap: 2,
  },
  communityLabel: {
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 10,
    lineHeight: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  scoreValue: {
    color: colors.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scoreOutOf: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  countLabel: {
    fontVariant: ['tabular-nums'],
    fontSize: 11,
    lineHeight: 14,
  },
  rows: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 16,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowPressed: {
    opacity: 0.85,
  },
  starLabel: {
    width: 22,
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
    height: 5,
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
  count: {
    width: 22,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    lineHeight: 12,
  },
});
