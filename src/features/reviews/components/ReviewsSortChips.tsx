import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { ReviewSortOption } from '../types';
import { getReviewSortLabel, REVIEW_SORT_OPTIONS } from '../utils/review-sort';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ReviewsSortChipsProps {
  value: ReviewSortOption;
  onChange: (value: ReviewSortOption) => void;
}

export function ReviewsSortChips({ value, onChange }: ReviewsSortChipsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {REVIEW_SORT_OPTIONS.map((option) => {
        const selected = value === option;
        const label = getReviewSortLabel(option);

        return (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t('common.sortByLabel', { label })}
            onPress={() => onChange(option)}
            style={[
              styles.chip,
              styles.chipOutlined,
              selected && styles.chipOutlinedSelected,
            ]}
            testID={`reviews-sort-chip-${option}`}
          >
            <AppText
              variant="caption"
              style={[
                styles.label,
                selected && styles.labelOutlinedSelected,
              ]}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: spacing.xs,
  },
  chip: {
    minHeight: 28,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOutlined: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  chipOutlinedSelected: {
    backgroundColor: colors.accentTint12,
    borderColor: colors.borderAccent,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 14,
  },
  labelOutlinedSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
