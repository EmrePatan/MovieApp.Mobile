import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { ReviewSortOption } from '../types';
import { getReviewSortLabel, REVIEW_SORT_OPTIONS } from '../utils/review-sort';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';

interface ReviewsSortControlProps {
  value: ReviewSortOption;
  onChange: (value: ReviewSortOption) => void;
}

export function ReviewsSortControl({ value, onChange }: ReviewsSortControlProps) {
  const { t } = useTranslation();

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
            accessibilityLabel={t('common.sortByLabel', { label: getReviewSortLabel(option) })}
            onPress={() => onChange(option)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <AppText
              variant="caption"
              numberOfLines={1}
              style={[styles.label, selected && styles.labelSelected]}
            >
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
    paddingVertical: 2,
  },
  chip: {
    minHeight: interaction.touchTarget,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 180,
  },
  chipSelected: {
    backgroundColor: colors.accentTint12,
    borderColor: colors.borderAccent,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
  },
  labelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
