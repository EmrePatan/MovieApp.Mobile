import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { ReviewResponse } from '../types';
import {
  formatReviewDateLabel,
  getAuthorInitials,
} from '../utils/review-format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ReviewCardProps {
  review: ReviewResponse;
  isOwnReview?: boolean;
}

export const ReviewCard = memo(function ReviewCard({
  review,
  isOwnReview = false,
}: ReviewCardProps) {
  const dateLabel = formatReviewDateLabel(review.createdAt, review.updatedAt);

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.header}>
        <View style={styles.avatar} accessibilityLabel={`${review.user.displayName} avatar`}>
          <AppText variant="caption" style={styles.avatarText}>
            {getAuthorInitials(review.user.displayName)}
          </AppText>
        </View>
        <View style={styles.meta}>
          <AppText variant="body">
            {review.user.displayName}
            {isOwnReview ? ' · You' : ''}
          </AppText>
          <AppText variant="caption" muted>
            {dateLabel}
          </AppText>
        </View>
      </View>
      <AppText variant="bodySmall" style={styles.content}>
        {review.content}
      </AppText>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  content: {
    lineHeight: 20,
  },
});
