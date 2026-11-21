import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { ReviewResponse } from '../types';
import { UserAvatar } from '@/components/common/UserAvatar';
import { formatReviewDateLabel } from '../utils/review-format';
import {
  likelyExceedsCollapsedLines,
  REVIEW_LIST_COLLAPSED_LINE_COUNT,
} from '../utils/review-content-length';
import {
  backendScoreToStarRating,
  formatStarRatingDisplay,
  isValidBackendScore,
} from '@/features/ratings/utils/star-rating';
import { ReviewStarRow } from './ReviewStarRow';
import { ReviewRichBody } from './ReviewRichBody';
import { parseSocialCommentContent } from '@/features/social/utils/social-comment-media';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

const AVATAR_SIZE = 40;

type ReviewCardVariant = 'row' | 'surface';

interface ReviewCardProps {
  review: ReviewResponse;
  isOwnReview?: boolean;
  variant?: ReviewCardVariant;
  isDeleting?: boolean;
  isLikePending?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
  onOpenComments?: () => void;
}

export const ReviewCard = memo(function ReviewCard({
  review,
  isOwnReview = false,
  variant = 'row',
  isDeleting = false,
  isLikePending = false,
  onEdit,
  onDelete,
  onLike,
  onOpenComments,
}: ReviewCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const dateLabel = formatReviewDateLabel(review.createdAt, review.updatedAt);
  const content = review.content.trim();
  const textOnly = parseSocialCommentContent(content).text;
  const canExpand = likelyExceedsCollapsedLines(textOnly, REVIEW_LIST_COLLAPSED_LINE_COUNT);
  const hasActions = isOwnReview && (onEdit || onDelete);
  const likesCount = review.likesCount ?? 0;
  const commentsCount = review.commentsCount ?? 0;
  const isLiked = Boolean(review.isLikedByMe);
  const canEngage = Boolean(review.socialActivityId);
  const starRating =
    review.userRating != null && isValidBackendScore(review.userRating)
      ? backendScoreToStarRating(review.userRating)
      : null;

  return (
    <View
      style={[styles.card, variant === 'surface' && styles.cardSurface]}
      accessibilityRole="summary"
      testID={isOwnReview ? 'review-card-own' : 'review-card'}
    >
      <View style={styles.header}>
        <UserAvatar
          displayName={review.user.displayName}
          effectiveAvatarUrl={review.user.effectiveAvatarUrl}
          size={AVATAR_SIZE}
          variant={isOwnReview ? 'accent' : 'default'}
          accessibilityLabel={t('profile.avatarAccessibility', {
            name: review.user.displayName,
          })}
        />

        <View style={styles.meta}>
          <View style={styles.nameRow}>
            <AppText variant="bodySmall" style={styles.authorName} numberOfLines={1}>
              {review.user.displayName}
            </AppText>
            {isOwnReview ? (
              <View style={styles.youBadge}>
                <AppText variant="caption" style={styles.youBadgeText}>
                  {t('reviews.youBadge')}
                </AppText>
              </View>
            ) : null}
            {hasActions ? (
              <View style={styles.actions}>
                {onEdit ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('reviews.editReview')}
                    hitSlop={8}
                    onPress={onEdit}
                    style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                  >
                    <Ionicons name="pencil-outline" size={16} color={colors.textMuted} />
                  </Pressable>
                ) : null}
                {onDelete ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('common.deleteReview')}
                    disabled={isDeleting}
                    hitSlop={8}
                    onPress={onDelete}
                    style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color={colors.textMuted} size="small" />
                    ) : (
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    )}
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>

          {starRating != null ? (
            <View
              testID="review-author-rating"
              accessibilityRole="text"
              accessibilityLabel={t('reviews.ratedOutOfFiveStars', {
                label: formatStarRatingDisplay(starRating),
              })}
            >
              <ReviewStarRow starRating={starRating} size={13} />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.body}>
        <ReviewRichBody
          content={content}
          review={isOwnReview ? undefined : review}
          plain={isOwnReview}
          numberOfLines={
            expanded ? undefined : canExpand ? REVIEW_LIST_COLLAPSED_LINE_COUNT : undefined
          }
        />
        {canExpand ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              expanded
                ? t('common.showLessOfReview', { name: review.user.displayName })
                : t('common.readMoreOfReview', { name: review.user.displayName })
            }
            onPress={() => setExpanded((current) => !current)}
            hitSlop={4}
            style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}
            testID="review-card-expand"
          >
            <AppText variant="caption" style={styles.expandLabel}>
              {expanded ? t('common.showLess') : t('common.readMore')}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.footer}>
        {canEngage ? (
          <View style={styles.engagement}>
            {isOwnReview || !onLike ? (
              <View
                style={styles.engageHit}
                accessibilityRole="text"
                accessibilityLabel={`${t('social.like')}: ${likesCount}`}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={16}
                  color={isLiked ? colors.accentStrong : colors.textMuted}
                />
                <AppText style={[styles.engageCount, isLiked && styles.engageCountActive]}>
                  {likesCount}
                </AppText>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isLiked ? t('social.unlike') : t('social.like')}
                disabled={isLikePending}
                onPress={onLike}
                hitSlop={8}
                style={({ pressed }) => [styles.engageHit, pressed && styles.pressed]}
              >
                {isLikePending ? (
                  <ActivityIndicator color={colors.textMuted} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={16}
                      color={isLiked ? colors.accentStrong : colors.textMuted}
                    />
                    <AppText style={[styles.engageCount, isLiked && styles.engageCountActive]}>
                      {likesCount}
                    </AppText>
                  </>
                )}
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.commentsCount')}
              onPress={onOpenComments}
              disabled={!onOpenComments}
              hitSlop={8}
              style={({ pressed }) => [styles.engageHit, pressed && styles.pressed]}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={15} color={colors.textMuted} />
              <AppText style={styles.engageCount}>{commentsCount}</AppText>
            </Pressable>
          </View>
        ) : (
          <View />
        )}
        <AppText variant="caption" muted style={styles.dateFooter} numberOfLines={1}>
          {dateLabel}
        </AppText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cardSurface: {
    marginHorizontal: layout.screenPaddingHorizontal,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  meta: {
    flex: 1,
    gap: 6,
    minWidth: 0,
    paddingTop: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 0,
  },
  authorName: {
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  body: {
    gap: spacing.xs,
  },
  content: {
    lineHeight: 22,
    color: colors.textPrimary,
    letterSpacing: 0.12,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 28,
  },
  engagement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 1,
  },
  engageHit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 32,
  },
  engageCount: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  engageCountActive: {
    color: colors.accentStrong,
  },
  dateFooter: {
    fontSize: 11,
    lineHeight: 14,
    flexShrink: 0,
  },
  expandButton: {
    alignSelf: 'flex-start',
  },
  expandLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 11,
  },
  youBadge: {
    backgroundColor: colors.accentTint12,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    flexShrink: 0,
  },
  youBadgeText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: -spacing.xs,
  },
  actionButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
