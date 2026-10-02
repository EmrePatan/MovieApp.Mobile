import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { openReviewsDetail } from '@/features/details/shared/navigation/reviews-detail-navigation';
import {
  buildMovieReviewsRoute,
  buildTvReviewsRoute,
} from '@/features/details/shared/routes';
import { useReviewsQuery } from '../hooks/useReviewsQuery';
import type { ReviewContentType } from '../types';
import { DETAIL_REVIEWS_PREVIEW_PAGE_SIZE } from '../types';
import { ReviewPreviewCard } from './ReviewPreviewCard';
import {
  DETAIL_REVIEW_PREVIEW_MAX_ITEMS,
  DETAIL_REVIEW_PREVIEW_TRAILING_PEEK,
  getDetailReviewPreviewCardDimensions,
} from '../utils/detail-review-preview-layout';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

interface ReviewsLinkRowProps {
  contentType: ReviewContentType;
  contentId: string;
  contentTitle: string;
}

export function ReviewsLinkRow({
  contentType,
  contentId,
  contentTitle,
}: ReviewsLinkRowProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const cardDimensions = useMemo(
    () => getDetailReviewPreviewCardDimensions(screenWidth),
    [screenWidth],
  );
  const reviewsQuery = useReviewsQuery(contentType, contentId, {
    page: 1,
    pageSize: DETAIL_REVIEWS_PREVIEW_PAGE_SIZE,
  });
  const totalCount = reviewsQuery.data?.totalCount;
  const isCountLoading = reviewsQuery.isLoading && totalCount == null;
  const hasReviews = totalCount != null && totalCount > 0;
  const countLabel = totalCount == null ? null : String(totalCount);
  const previewItems = useMemo(
    () => (reviewsQuery.data?.items ?? []).slice(0, DETAIL_REVIEW_PREVIEW_MAX_ITEMS),
    [reviewsQuery.data?.items],
  );
  const trailingAccessibilityLabel = isCountLoading
    ? t('details.reviewsLink.countLoading')
    : hasReviews
      ? t(totalCount === 1 ? 'common.reviewCount' : 'common.reviewsCount', { count: totalCount })
      : t('details.reviewsLink.noReviewsYet');

  const handlePress = useCallback(() => {
    const reviewsRoute =
      contentType === 'movie'
        ? buildMovieReviewsRoute(contentId, { title: contentTitle })
        : buildTvReviewsRoute(contentId, { title: contentTitle });

    openReviewsDetail(router, reviewsRoute);
  }, [contentId, contentTitle, contentType, router]);

  return (
    <View style={styles.section} testID="reviews-link-row">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('details.reviewsLink.accessibility', {
          status: trailingAccessibilityLabel,
        })}
        onPress={handlePress}
        style={({ pressed }) => [styles.headerRow, pressed && styles.pressed]}
        testID="reviews-link-row-button"
      >
        <AppText variant="subtitle" style={styles.headerTitle}>
          {t('details.reviewsLink.title')}
        </AppText>
        <View style={styles.trailing}>
          {isCountLoading ? (
            <ActivityIndicator color={colors.accent} size="small" testID="reviews-count-loading" />
          ) : hasReviews ? (
            <AppText variant="caption" style={styles.count} testID="reviews-count">
              {countLabel}
            </AppText>
          ) : (
            <AppText variant="caption" muted style={styles.emptyLabel} testID="reviews-empty-label">
              {t('details.reviewsLink.noReviewsYet')}
            </AppText>
          )}
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </Pressable>

      {hasReviews && previewItems.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          testID="reviews-preview-rail"
          contentContainerStyle={[
            styles.railContent,
            { paddingRight: layout.screenPaddingHorizontal + DETAIL_REVIEW_PREVIEW_TRAILING_PEEK },
          ]}
        >
          {previewItems.map((review) => (
            <ReviewPreviewCard
              key={review.id}
              review={review}
              width={cardDimensions.width}
              height={cardDimensions.height}
              onPress={handlePress}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    minHeight: layout.touchTarget,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    letterSpacing: 0.15,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: -spacing.sm,
  },
  count: {
    color: colors.accent,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  emptyLabel: {
    fontWeight: '500',
  },
  railContent: {
    paddingLeft: layout.screenPaddingHorizontal,
    paddingTop: spacing.xs,
    flexDirection: 'row',
  },
});
