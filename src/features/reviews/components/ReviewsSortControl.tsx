import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { ReviewSortOption } from '../types';
import { getReviewSortLabel, REVIEW_SORT_OPTIONS } from '../utils/review-sort';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';

interface ReviewsSortControlProps {
  value: ReviewSortOption;
  onChange: (value: ReviewSortOption) => void;
}

export function ReviewsSortControl({ value, onChange }: ReviewsSortControlProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.wrapper}
      testID="reviews-sort-control"
      accessibilityRole="tablist"
    >
      {REVIEW_SORT_OPTIONS.map((option) => {
        const selected = value === option;

        return (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`Sort by ${getReviewSortLabel(option)}`}
            onPress={() => onChange(option)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <AppText variant="caption" style={[styles.label, selected && styles.labelSelected]}>
              {getReviewSortLabel(option)}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  chip: {
    minHeight: 28,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.accentTint12,
    borderColor: colors.borderAccent,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 14,
  },
  labelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
