import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import { openCatalogDetailFromReviews } from '@/features/details/shared/navigation/reviews-detail-navigation';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import { formatCommunityStarRatingDisplay } from '@/features/ratings/utils/star-rating';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import type { ReviewContentType } from '../types';

const POSTER_WIDTH = 44;
const POSTER_HEIGHT = 66;

export interface ReviewsHeaderSummary {
  averageScore: number;
  ratingCount: number;
  reviewCount: number;
}

interface ReviewsScreenHeaderProps {
  contentType: ReviewContentType;
  contentId: string;
  contentTitle?: string;
  reviewCount?: number;
  posterPath?: string | null;
  showMeta?: boolean;
  summary?: ReviewsHeaderSummary;
}

export function ReviewsScreenHeader({
  contentType,
  contentId,
  contentTitle,
  reviewCount,
  posterPath,
  showMeta = true,
  summary,
}: ReviewsScreenHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const hasReviews = reviewCount !== undefined;
  const reviewCountLabel = hasReviews
    ? t(reviewCount === 1 ? 'common.reviewCount' : 'common.reviewsCount', {
        count: reviewCount,
      })
    : null;

  const handleOpenCatalogDetail = useCallback(() => {
    openCatalogDetailFromReviews(router, contentType, contentId);
  }, [contentId, contentType, router]);

  const catalogAccessibilityLabel = contentTitle
    ? t('common.openTitle', { title: contentTitle })
    : t('reviews.title');

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <DetailBackButton showLabel={false} contentInset iconOnlyLeading />
        <AppText variant="subtitle" style={styles.screenTitle} numberOfLines={1}>
          {t('reviews.title')}
        </AppText>
        <View style={styles.topSpacer} />
      </View>

      {showMeta && (contentTitle || reviewCountLabel) ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={catalogAccessibilityLabel}
          onPress={handleOpenCatalogDetail}
          style={({ pressed }) => [styles.titleRow, pressed && styles.titleRowPressed]}
          testID="reviews-header-catalog-link"
        >
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
              <View style={styles.contentTitleRow}>
                <AppText
                  variant="body"
                  style={styles.contentTitle}
                  numberOfLines={2}
                  testID="reviews-content-title"
                >
                  {contentTitle}
                </AppText>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            ) : null}
            {summary ? (
              <AppText
                variant="caption"
                muted
                numberOfLines={2}
                testID="reviews-header-summary"
              >
                {t('reviews.headerSummary', {
                  average: formatCommunityStarRatingDisplay(summary.averageScore),
                  ratingCount: summary.ratingCount,
                  reviewCount: summary.reviewCount,
                })}
              </AppText>
            ) : reviewCountLabel ? (
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
        </Pressable>
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
  titleRowPressed: {
    opacity: interaction.pressedOpacity,
  },
  contentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
    flexShrink: 1,
    color: colors.textPrimary,
    fontWeight: '700',
    lineHeight: 22,
  },
});
