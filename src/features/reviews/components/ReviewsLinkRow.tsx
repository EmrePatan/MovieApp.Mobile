import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
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
import { REVIEW_COUNT_PAGE_SIZE } from '../types';
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
  const router = useRouter();
  const reviewsQuery = useReviewsQuery(contentType, contentId, REVIEW_COUNT_PAGE_SIZE);
  const totalCount = reviewsQuery.data?.pages[0]?.totalCount;
  const isCountLoading = reviewsQuery.isLoading && totalCount == null;
  const countLabel = totalCount == null ? '0' : String(totalCount);
  const countAccessibilityLabel =
    totalCount == null
      ? 'Reviews count loading'
      : `${totalCount} ${totalCount === 1 ? 'review' : 'reviews'}`;

  const handlePress = useCallback(() => {
    const reviewsRoute =
      contentType === 'movie'
        ? buildMovieReviewsRoute(contentId, { title: contentTitle })
        : buildTvReviewsRoute(contentId, { title: contentTitle });

    openReviewsDetail(router, reviewsRoute);
  }, [contentId, contentTitle, contentType, router]);

  return (
    <View style={styles.container} testID="reviews-link-row">
      <View style={styles.separator} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Reviews, ${countAccessibilityLabel}`}
        onPress={handlePress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        testID="reviews-link-row-button"
      >
        <AppText variant="body" style={styles.label}>
          Reviews
        </AppText>
        <View style={styles.trailing}>
          {isCountLoading ? (
            <ActivityIndicator color={colors.accent} size="small" testID="reviews-count-loading" />
          ) : (
            <AppText variant="bodySmall" muted style={styles.count} testID="reviews-count">
              {countLabel}
            </AppText>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </Pressable>
      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.touchTarget,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  count: {
    minWidth: spacing.lg,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
