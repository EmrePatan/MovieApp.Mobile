import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';

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
      <View style={styles.row}>
        {contentTitle ? (
          <AppText
            variant="bodySmall"
            muted
            style={styles.title}
            numberOfLines={1}
            testID="reviews-content-title"
          >
            {contentTitle}
          </AppText>
        ) : null}

        {contentTitle && reviewCountLabel ? (
          <AppText variant="bodySmall" muted style={styles.separator} accessibilityElementsHidden>
            ·
          </AppText>
        ) : null}

        {reviewCountLabel ? (
          <AppText
            variant="bodySmall"
            style={styles.count}
            numberOfLines={1}
            testID="reviews-review-count"
          >
            {reviewCountLabel}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    minWidth: 0,
  },
  title: {
    fontWeight: '500',
    lineHeight: 20,
    flexShrink: 1,
  },
  separator: {
    lineHeight: 20,
    color: colors.textMuted,
  },
  count: {
    color: colors.textMuted,
    lineHeight: 20,
    flexShrink: 0,
  },
});
