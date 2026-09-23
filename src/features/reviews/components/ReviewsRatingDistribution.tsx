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
      <AppText variant="caption" style={styles.sectionLabel}>
        {t('reviews.communityRating')}
      </AppText>

      <View style={styles.card} testID="reviews-community-rating">
        <View style={styles.scoreBlock}>
          <View style={styles.scoreRow}>
            <Ionicons name="star" size={16} color={colors.accentStrong} />
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
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  scoreBlock: {
    minWidth: 72,
    maxWidth: 96,
    gap: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  scoreValue: {
    color: colors.textPrimary,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scoreOutOf: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 2,
  },
  countLabel: {
    fontVariant: ['tabular-nums'],
    fontSize: 11,
    lineHeight: 14,
  },
  rows: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 18,
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
  count: {
    width: 20,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    lineHeight: 12,
  },
});
