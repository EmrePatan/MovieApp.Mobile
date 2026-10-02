import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import type { ReviewResponse } from '../types';
import { formatReviewDateLabel } from '../utils/review-format';
import {
  DETAIL_REVIEW_PREVIEW_LINE_COUNT,
} from '../utils/detail-review-preview-layout';
import {
  backendScoreToStarRating,
  formatStarRatingDisplay,
  isValidBackendScore,
} from '@/features/ratings/utils/star-rating';
import { ReviewStarRow } from './ReviewStarRow';
import { ReviewTranslationControls } from './ReviewTranslationControls';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const AVATAR_SIZE = 32;

/** Detail rail cards: soft lift on page background, no shadows or section chrome. */
const PREVIEW_CARD_SURFACE = colors.surfaceElevated;
const PREVIEW_CARD_BORDER = colors.borderSubtle;

interface ReviewPreviewCardProps {
  review: ReviewResponse;
  width: number;
  height: number;
  onPress?: () => void;
}

export const ReviewPreviewCard = memo(function ReviewPreviewCard({
  review,
  width,
  height,
  onPress,
}: ReviewPreviewCardProps) {
  const { t } = useTranslation();
  const dateLabel = formatReviewDateLabel(review.createdAt, review.updatedAt);
  const starRating =
    review.userRating != null && isValidBackendScore(review.userRating)
      ? backendScoreToStarRating(review.userRating)
      : null;

  const content = (
    <>
      <View style={styles.header}>
        <UserAvatar
          displayName={review.user.displayName}
          effectiveAvatarUrl={review.user.effectiveAvatarUrl}
          size={AVATAR_SIZE}
          accessibilityLabel={t('profile.avatarAccessibility', {
            name: review.user.displayName,
          })}
        />
        <View style={styles.headerMeta}>
          <AppText variant="bodySmall" style={styles.authorName} numberOfLines={1}>
            {review.user.displayName}
          </AppText>
          {starRating != null ? (
            <View
              accessibilityRole="text"
              accessibilityLabel={t('reviews.ratedOutOfFiveStars', {
                label: formatStarRatingDisplay(starRating),
              })}
            >
              <ReviewStarRow starRating={starRating} size={12} />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.body}>
        <ReviewTranslationControls
          review={review}
          numberOfLines={DETAIL_REVIEW_PREVIEW_LINE_COUNT}
        />
      </View>

      <AppText variant="caption" muted style={styles.date} numberOfLines={1}>
        {dateLabel}
      </AppText>
    </>
  );

  if (!onPress) {
    return (
      <View
        style={[styles.card, { width, height }]}
        accessibilityRole="summary"
        testID={`review-preview-card-${review.id}`}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('details.reviewsLink.openReviewsFromPreview', {
        name: review.user.displayName,
      })}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width, height },
        pressed && styles.pressed,
      ]}
      testID={`review-preview-card-${review.id}`}
    >
      {content}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: PREVIEW_CARD_SURFACE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PREVIEW_CARD_BORDER,
    gap: spacing.xs,
    overflow: 'hidden',
    marginRight: spacing.sm,
    shadowOpacity: 0,
    elevation: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  authorName: {
    fontWeight: '600',
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 17,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  date: {
    alignSelf: 'flex-end',
    fontSize: 11,
    lineHeight: 14,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
