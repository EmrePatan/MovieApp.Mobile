import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { ReviewResponse } from '../types';
import {
  formatReviewDateLabel,
  getAuthorInitials,
} from '../utils/review-format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

type ReviewCardVariant = 'elevated' | 'flat';

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
  variant = 'flat',
  isDeleting = false,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const dateLabel = formatReviewDateLabel(review.createdAt, review.updatedAt);

  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.cardElevated,
        isOwnReview && variant === 'elevated' && styles.cardOwn,
      ]}
      accessibilityRole="summary"
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
          </View>
          <AppText variant="caption" muted>
            {dateLabel}
          </AppText>
        </View>
        {isOwnReview && (onEdit || onDelete) ? (
          <View style={styles.actions}>
            {onEdit ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit review"
                hitSlop={8}
                onPress={onEdit}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              >
                <Ionicons name="pencil-outline" size={15} color={colors.textMuted} />
              </Pressable>
            ) : null}
            {onDelete ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete review"
                disabled={isDeleting}
                hitSlop={8}
                onPress={onDelete}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              >
                {isDeleting ? (
                  <ActivityIndicator color={colors.textMuted} size="small" />
                ) : (
                  <Ionicons name="trash-outline" size={15} color={colors.danger} />
                )}
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
      <AppText variant="bodySmall" style={styles.content}>
        {review.content}
      </AppText>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  cardElevated: {
    paddingVertical: 0,
  },
  cardOwn: {
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOwn: {
    backgroundColor: colors.accentTint18,
  },
  avatarText: {
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  authorName: {
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
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
  content: {
    lineHeight: 22,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
    marginLeft: spacing.xs,
  },
  actionButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
