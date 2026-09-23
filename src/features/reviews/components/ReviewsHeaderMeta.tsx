import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface ReviewsHeaderMetaProps {
  contentTitle?: string;
  reviewCount?: number;
}

export function ReviewsHeaderMeta({
  contentTitle,
  reviewCount,
}: ReviewsHeaderMetaProps) {
  const { t } = useTranslation();
  const hasReviews = reviewCount !== undefined;

  if (!contentTitle && !hasReviews) {
    return null;
  }

  const reviewCountLabel = hasReviews
    ? t(reviewCount === 1 ? 'common.reviewCount' : 'common.reviewsCount', {
        count: reviewCount,
      })
    : null;

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

      {reviewCountLabel ? (
        <AppText variant="caption" muted testID="reviews-review-count">
          {reviewCountLabel}
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
