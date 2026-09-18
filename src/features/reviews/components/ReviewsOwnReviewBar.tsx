import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { ReviewAuthorRating } from './ReviewAuthorRating';
import type { ReviewResponse } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';

const COLLAPSED_LINE_COUNT = 2;
/** Rough threshold before 2-line clamp likely truncates on typical phone widths. */
const LIKELY_TRUNCATED_LENGTH = 96;

interface ReviewsOwnReviewBarProps {
  review: ReviewResponse;
  onEdit: () => void;
}

export function ReviewsOwnReviewBar({ review, onEdit }: ReviewsOwnReviewBarProps) {
  const [expanded, setExpanded] = useState(false);
  const content = review.content.trim();
  const canExpand = content.length > LIKELY_TRUNCATED_LENGTH;

  return (
    <View style={styles.container} testID="reviews-own-review-bar">
      <View style={styles.textBlock}>
        <View style={styles.labelRow}>
          <AppText variant="caption" style={styles.label}>
            Your review
          </AppText>
          <ReviewAuthorRating userRating={review.userRating} />
        </View>
        <AppText
          variant="bodySmall"
          muted
          numberOfLines={expanded ? undefined : COLLAPSED_LINE_COUNT}
          style={styles.preview}
        >
          {content}
        </AppText>
        {canExpand ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Show less of your review' : 'Read more of your review'}
            onPress={() => setExpanded((current) => !current)}
            hitSlop={4}
            style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}
            testID="reviews-own-review-expand"
          >
            <AppText variant="caption" style={styles.expandLabel}>
              {expanded ? 'Show less' : 'Read more'}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit review"
        onPress={onEdit}
        hitSlop={8}
        style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
      >
        <AppText variant="caption" style={styles.editLabel}>
          Edit
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: layout.screenPaddingHorizontal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  label: {
    color: colors.accent,
    fontWeight: '600',
  },
  preview: {
    lineHeight: 20,
  },
  expandButton: {
    alignSelf: 'flex-start',
  },
  expandLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  editButton: {
    minHeight: interaction.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  editLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
