import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface InsightsYearSelectorProps {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  compact?: boolean;
}

export function InsightsYearSelector({
  years,
  selectedYear,
  onSelectYear,
  compact = false,
}: InsightsYearSelectorProps) {
  const { t } = useTranslation();

  if (years.length <= 1) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, compact && styles.contentCompact]}
      testID="insights-year-selector"
    >
      {years.map((year) => {
        const selected = year === selectedYear;
        return (
          <Pressable
            key={year}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={t('insights.yourYear.yearSelectorAccessibility', { year })}
            onPress={() => onSelectYear(year)}
            style={({ pressed }) => [
              styles.chip,
              compact && styles.chipCompact,
              selected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
            testID={`insights-year-${year}`}
          >
            <AppText variant="caption" style={[styles.chipText, selected && styles.chipTextSelected]}>
              {year}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  contentCompact: {
    paddingVertical: 0,
    justifyContent: 'flex-end',
  },
  chip: {
    borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipSelected: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint14,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  chipTextSelected: {
    color: colors.accentStrong,
  },
});
