import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { AdvancedDiscoverFilters } from '../advanced-discover-types';
import {
  type AdvancedDiscoverQuickFilterKey,
  isQuickFilterActive,
} from '../utils/advanced-discover-quick-filters';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const QUICK_FILTER_KEYS: AdvancedDiscoverQuickFilterKey[] = [
  'underTwoHours',
  'runtime90to120',
  'rating7Plus',
  'year2015Plus',
  'streaming',
];

interface AdvancedDiscoverQuickFiltersProps {
  filters: AdvancedDiscoverFilters;
  onToggle: (key: AdvancedDiscoverQuickFilterKey) => void;
}

export function AdvancedDiscoverQuickFilters({
  filters,
  onToggle,
}: AdvancedDiscoverQuickFiltersProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {QUICK_FILTER_KEYS.map((key) => {
        const selected = isQuickFilterActive(key, filters);
        const label = t(`discovery.advancedDiscover.quickFilters.${key}`);

        return (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            onPress={() => onToggle(key)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <AppText variant="caption" style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
      <View style={styles.trailingSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
  },
  chipLabel: {
    color: colors.textPrimary,
  },
  chipLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  trailingSpacer: {
    width: spacing.xs,
  },
});
