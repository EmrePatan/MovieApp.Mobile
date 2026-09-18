import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ReviewsHeaderMetaProps {
  contentTitle?: string;
  reviewCount?: number;
}

function formatReviewCountLabel(totalCount: number): string {
  return `${totalCount} ${totalCount === 1 ? 'review' : 'reviews'}`;
}

export function ReviewsHeaderMeta({
  contentTitle,
  reviewCount,
}: ReviewsHeaderMetaProps) {
  const hasReviews = reviewCount !== undefined;

  if (!contentTitle && !hasReviews) {
    return null;
  }

  return (
    <View style={styles.container} testID="reviews-header-meta">
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
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
