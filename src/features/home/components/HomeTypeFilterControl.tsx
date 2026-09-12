import type { HomeTypeFilter } from '../types';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const FILTERS: { label: string; value: HomeTypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv' },
];

interface HomeTypeFilterControlProps {
  value: HomeTypeFilter;
  onChange: (value: HomeTypeFilter) => void;
}

export function HomeTypeFilterControl({ value, onChange }: HomeTypeFilterControlProps) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {FILTERS.map((filter) => {
        const selected = value === filter.value;

        return (
          <Pressable
            key={filter.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`Show ${filter.label}`}
            onPress={() => onChange(filter.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <AppText variant="bodySmall" style={selected ? styles.labelSelected : styles.label}>
              {filter.label}
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
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
