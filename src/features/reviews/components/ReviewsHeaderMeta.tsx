import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { formatCommunityStarRatingDisplay } from '@/features/ratings/utils/star-rating';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ReviewsHeaderMetaProps {
  contentTitle?: string;
  reviewCount?: number;
  averageScore?: number;
}

function formatReviewCountLabel(totalCount: number): string {
  return `${totalCount} ${totalCount === 1 ? 'review' : 'reviews'}`;
}

export function ReviewsHeaderMeta({
  contentTitle,
  reviewCount,
  averageScore,
}: ReviewsHeaderMetaProps) {
  const hasStarRating = averageScore !== undefined && averageScore > 0;
  const hasReviews = reviewCount !== undefined;
  const starLabel = hasStarRating ? formatCommunityStarRatingDisplay(averageScore) : null;

  if (!contentTitle && !hasStarRating && !hasReviews) {
    return null;
  }

  return (
    <View style={styles.container} testID="reviews-header-meta">
      <View style={styles.primaryRow}>
        {contentTitle ? (
          <AppText
            variant="bodySmall"
            style={styles.title}
            numberOfLines={2}
            testID="reviews-content-title"
          >
            {contentTitle}
          </AppText>
        ) : null}

        {contentTitle && hasStarRating ? (
          <AppText variant="bodySmall" muted style={styles.separator}>
            ·
          </AppText>
        ) : null}

        {hasStarRating ? (
          <View style={styles.ratingGroup} testID="reviews-header-rating">
            <Ionicons name="star" size={13} color={colors.accentStrong} />
            <AppText variant="bodySmall" style={styles.starValue}>
              {starLabel}
            </AppText>
          </View>
        ) : null}
      </View>

      {hasReviews ? (
        <AppText variant="caption" muted testID="reviews-review-count">
          {formatReviewCountLabel(reviewCount!)}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  primaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  separator: {
    marginHorizontal: 1,
  },
});
