import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={styles.wrapper} testID="reviews-sort-control">
      <View style={styles.labelRow}>
        <Ionicons name="swap-vertical-outline" size={14} color={colors.textMuted} />
        <AppText variant="caption" muted>
          Sort
        </AppText>
      </View>
      <View style={styles.container} accessibilityRole="tablist">
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: spacing.sm + 2,
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
  },
  labelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
