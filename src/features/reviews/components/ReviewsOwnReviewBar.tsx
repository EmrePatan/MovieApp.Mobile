import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ReviewAuthorRating } from './ReviewAuthorRating';
import { ReviewRichBody } from './ReviewRichBody';
import type { ReviewResponse } from '../types';
import {
  likelyExceedsCollapsedLines,
  REVIEW_OWN_COLLAPSED_LINE_COUNT,
} from '../utils/review-content-length';
import { parseSocialCommentContent } from '@/features/social/utils/social-comment-media';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';

const AVATAR_SIZE = 40;

interface ReviewsOwnReviewBarProps {
  review: ReviewResponse;
  onEdit: () => void;
  onOpenComments?: () => void;
}

export function ReviewsOwnReviewBar({ review, onEdit, onOpenComments }: ReviewsOwnReviewBarProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const content = review.content.trim();
  const textOnly = parseSocialCommentContent(content).text;
  const canExpand = likelyExceedsCollapsedLines(textOnly, REVIEW_OWN_COLLAPSED_LINE_COUNT);
  const likesCount = review.likesCount ?? 0;
  const commentsCount = review.commentsCount ?? 0;
  const isLiked = Boolean(review.isLikedByMe);
  const canEngage = Boolean(review.socialActivityId);

  return (
    <View style={styles.wrapper} testID="reviews-own-review-bar">
      <View style={styles.card}>
        <View style={styles.header}>
          <UserAvatar
            displayName={review.user.displayName}
            effectiveAvatarUrl={review.user.effectiveAvatarUrl}
            size={AVATAR_SIZE}
            variant="accent"
            accessibilityLabel={t('profile.avatarAccessibility', {
              name: review.user.displayName,
            })}
          />
          <View style={styles.headerMeta}>
            <View style={styles.headerRow}>
              <View style={styles.labelRow}>
                <AppText variant="caption" style={styles.label}>
                  {t('reviews.yourReview')}
                </AppText>
                <ReviewAuthorRating userRating={review.userRating} variant="inline" />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('reviews.editReview')}
                onPress={onEdit}
                hitSlop={8}
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
              >
                <AppText variant="caption" style={styles.editLabel}>
                  {t('reviews.edit')}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>

        <ReviewRichBody
          content={content}
          plain
          revealSpoiler
          textVariant="bodySmall"
          numberOfLines={expanded ? undefined : REVIEW_OWN_COLLAPSED_LINE_COUNT}
        />

        {canExpand ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              expanded ? t('common.showLessOfYourReview') : t('common.readMoreOfYourReview')
            }
            onPress={() => setExpanded((current) => !current)}
            hitSlop={4}
            style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}
            testID="reviews-own-review-expand"
          >
            <AppText variant="caption" style={styles.expandLabel}>
              {expanded ? t('common.showLess') : t('common.readMore')}
            </AppText>
          </Pressable>
        ) : null}

        {canEngage ? (
          <View style={styles.engagement}>
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
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  card: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerMeta: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 28,
  },
  labelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
    minWidth: 0,
  },
  label: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  expandButton: {
    alignSelf: 'flex-start',
  },
  expandLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 11,
  },
  editButton: {
    minHeight: interaction.touchTarget,
    minWidth: interaction.touchTarget,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
  editLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 12,
  },
  engagement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
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
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
