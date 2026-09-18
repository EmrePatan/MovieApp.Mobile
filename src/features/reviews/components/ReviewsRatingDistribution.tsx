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
      <View style={styles.communityHeader} testID="reviews-community-rating">
        <AppText variant="caption" style={styles.communityLabel}>
          Community
        </AppText>
        <AppText variant="caption" style={styles.communityValue}>
          ★ {formatCommunityStarRatingDisplay(averageScore)} / 5
        </AppText>
        <AppText variant="caption" muted style={styles.communitySeparator}>
          ·
        </AppText>
        <AppText variant="caption" style={styles.communityValue}>
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
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
  },
  communityHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  communityLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  communityValue: {
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  communitySeparator: {
    marginHorizontal: 1,
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
