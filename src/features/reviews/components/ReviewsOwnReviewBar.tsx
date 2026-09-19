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
        <View style={styles.labelRow}>
          <AppText variant="caption" style={styles.label}>
            {t('reviews.yourReview')}
          </AppText>
          <ReviewAuthorRating userRating={review.userRating} />
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
      <AppText
        variant="bodySmall"
        muted
        numberOfLines={expanded ? undefined : REVIEW_OWN_COLLAPSED_LINE_COUNT}
        style={styles.preview}
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
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  labelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  label: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  preview: {
    lineHeight: 19,
    fontSize: 13,
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginTop: 1,
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
    justifyContent: 'flex-start',
    paddingTop: 1,
    marginTop: -6,
    marginRight: -4,
  },
  editLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 11,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
