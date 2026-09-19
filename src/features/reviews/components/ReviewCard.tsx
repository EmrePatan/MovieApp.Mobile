import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { ReviewResponse } from '../types';
import {
  formatReviewDateLabel,
  getAuthorInitials,
} from '../utils/review-format';
import {
  likelyExceedsCollapsedLines,
  REVIEW_LIST_COLLAPSED_LINE_COUNT,
} from '../utils/review-content-length';
import { ReviewAuthorRating } from './ReviewAuthorRating';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

const AVATAR_SIZE = 34;
const CONTENT_INDENT = AVATAR_SIZE + spacing.sm;

type ReviewCardVariant = 'row' | 'surface';

interface ReviewCardProps {
  review: ReviewResponse;
  isOwnReview?: boolean;
  variant?: ReviewCardVariant;
  isDeleting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ReviewCard = memo(function ReviewCard({
  review,
  isOwnReview = false,
  variant = 'row',
  isDeleting = false,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const dateLabel = formatReviewDateLabel(review.createdAt, review.updatedAt);
  const content = review.content.trim();
  const canExpand = likelyExceedsCollapsedLines(content, REVIEW_LIST_COLLAPSED_LINE_COUNT);

  return (
    <View
      style={[
        styles.card,
        variant === 'surface' && styles.cardSurface,
      ]}
      accessibilityRole="summary"
      testID={isOwnReview ? 'review-card-own' : 'review-card'}
    >
      <View style={styles.header}>
        <View
          style={[styles.avatar, isOwnReview && styles.avatarOwn]}
          accessibilityLabel={`${review.user.displayName} avatar`}
        >
          <AppText variant="caption" style={styles.avatarText}>
            {getAuthorInitials(review.user.displayName)}
          </AppText>
        </View>
        <View style={styles.meta}>
          <View style={styles.nameRow}>
            <AppText variant="bodySmall" style={styles.authorName} numberOfLines={1}>
              {review.user.displayName}
            </AppText>
            {isOwnReview ? (
              <View style={styles.youBadge}>
                <AppText variant="caption" style={styles.youBadgeText}>You</AppText>
              </View>
            ) : null}
            <ReviewAuthorRating userRating={review.userRating} />
          </View>
          <AppText variant="caption" muted style={styles.dateLabel}>
            {dateLabel}
          </AppText>
        </View>
        {isOwnReview && (onEdit || onDelete) ? (
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
      <View style={styles.body}>
        <AppText
          variant="bodySmall"
          style={styles.content}
          numberOfLines={expanded ? undefined : canExpand ? REVIEW_LIST_COLLAPSED_LINE_COUNT : undefined}
        >
          {content}
        </AppText>
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
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
  },
  cardSurface: {
    marginHorizontal: layout.screenPaddingHorizontal,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarOwn: {
    backgroundColor: colors.accentTint12,
    borderColor: colors.accentTint18,
  },
  avatarText: {
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontSize: 11,
  },
  meta: {
    flex: 1,
    gap: 3,
    paddingTop: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  authorName: {
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  dateLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  body: {
    paddingLeft: CONTENT_INDENT,
    gap: 3,
  },
  content: {
    lineHeight: 20,
    color: colors.textSecondary,
    letterSpacing: 0.1,
    fontSize: 13,
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
  },
  youBadgeText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
    marginLeft: spacing.xs,
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
