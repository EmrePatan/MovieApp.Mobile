import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { ReviewAuthorRating } from './ReviewAuthorRating';
import type { ReviewResponse } from '../types';
import {
  likelyExceedsCollapsedLines,
  REVIEW_OWN_COLLAPSED_LINE_COUNT,
} from '../utils/review-content-length';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';

interface ReviewsOwnReviewBarProps {
  review: ReviewResponse;
  onEdit: () => void;
}

export function ReviewsOwnReviewBar({ review, onEdit }: ReviewsOwnReviewBarProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const content = review.content.trim();
  const canExpand = likelyExceedsCollapsedLines(content, REVIEW_OWN_COLLAPSED_LINE_COUNT);

  return (
    <View style={styles.container} testID="reviews-own-review-bar">
      <View style={styles.headerRow}>
        <AppText variant="caption" style={styles.label}>
          {t('reviews.yourReview')}
        </AppText>
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

      <ReviewAuthorRating userRating={review.userRating} variant="inline" size="md" />

      <AppText
        variant="bodySmall"
        style={styles.preview}
        numberOfLines={expanded ? undefined : REVIEW_OWN_COLLAPSED_LINE_COUNT}
      >
        {content}
      </AppText>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginHorizontal: layout.screenPaddingHorizontal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    color: colors.accentMuted,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  preview: {
    lineHeight: 21,
    color: colors.textPrimary,
    fontSize: 14,
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
    marginTop: -spacing.xs,
    marginBottom: -spacing.xs,
  },
  editLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 12,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
