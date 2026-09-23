import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

const POSTER_WIDTH = 44;
const POSTER_HEIGHT = 66;

interface ReviewsScreenHeaderProps {
  contentTitle?: string;
  reviewCount?: number;
  posterPath?: string | null;
  showMeta?: boolean;
}

export function ReviewsScreenHeader({
  contentTitle,
  reviewCount,
  posterPath,
  showMeta = true,
}: ReviewsScreenHeaderProps) {
  const { t } = useTranslation();
  const hasReviews = reviewCount !== undefined;
  const reviewCountLabel = hasReviews
    ? t(reviewCount === 1 ? 'common.reviewCount' : 'common.reviewsCount', {
        count: reviewCount,
      })
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <DetailBackButton contentInset={false} />
        <AppText variant="subtitle" style={styles.screenTitle} numberOfLines={1}>
          {t('reviews.title')}
        </AppText>
        <View style={styles.topSpacer} />
      </View>

      {showMeta && (contentTitle || reviewCountLabel) ? (
        <View style={styles.titleRow}>
          {posterPath ? (
            <PosterImage
              uri={posterPath}
              width={POSTER_WIDTH}
              height={POSTER_HEIGHT}
              accessibilityLabel={
                contentTitle
                  ? t('common.posterAccessibility', { title: contentTitle })
                  : t('reviews.title')
              }
              elevated
            />
          ) : (
            <View style={styles.posterPlaceholder} />
          )}

          <View style={styles.titleMeta} testID="reviews-header-meta">
            {contentTitle ? (
              <AppText
                variant="body"
                style={styles.contentTitle}
                numberOfLines={2}
                testID="reviews-content-title"
              >
                {contentTitle}
              </AppText>
            ) : null}
            {reviewCountLabel ? (
              <AppText
                variant="caption"
                muted
                numberOfLines={1}
                testID="reviews-review-count"
              >
                {reviewCountLabel}
              </AppText>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.touchTarget,
  },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  topSpacer: {
    width: layout.touchTarget,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  posterPlaceholder: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  titleMeta: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  contentTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    lineHeight: 22,
  },
});
