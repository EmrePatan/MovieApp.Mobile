import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import { openCatalogDetailFromReviews } from '@/features/details/shared/navigation/reviews-detail-navigation';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import { authTypography } from '@/features/auth/auth-typography';
import { useAuthFonts } from '@/features/auth/useAuthFonts';
import { formatCommunityStarRatingDisplay } from '@/features/ratings/utils/star-rating';
import { resolveImageUri } from '@/utils/image-url';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import type { ReviewContentType } from '../types';

const POSTER_WIDTH = 60;
const POSTER_HEIGHT = 90;

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
  useAuthFonts();
  const router = useRouter();
  const glowUri = posterPath?.trim() ? resolveImageUri(posterPath, 'w300') : null;
  const hasReviews = reviewCount !== undefined;
  const reviewCountLabel = hasReviews
    ? t(reviewCount === 1 ? 'common.reviewCount' : 'common.reviewsCount', {
        count: reviewCount,
      })
    : null;

  const handleOpenCatalogDetail = useCallback(() => {
    if (contentType === 'episode') {
      if (router.canGoBack()) {
        router.back();
      }
      return;
    }

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
          {glowUri ? (
            <View pointerEvents="none" style={styles.glow} accessibilityElementsHidden>
              <Image
                source={{ uri: glowUri }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                blurRadius={45}
                cachePolicy="memory-disk"
              />
              <LinearGradient
                colors={['rgba(8,8,10,0.30)', 'rgba(8,8,10,0.78)']}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ) : null}
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
  // Editorial serif title, same voice as the feed and comments screens.
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 24,
    lineHeight: 30,
  },
  topSpacer: {
    width: layout.touchTarget,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
    padding: spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: glass.panel,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
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
    backgroundColor: glass.panel,
  },
  titleMeta: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  contentTitle: {
    flexShrink: 1,
    color: colors.textPrimary,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 19,
    lineHeight: 24,
  },
});
