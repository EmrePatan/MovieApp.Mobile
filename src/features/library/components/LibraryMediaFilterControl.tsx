import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { CatalogMediaFilter } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const FILTERS: { label: string; value: CatalogMediaFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv' },
];

interface LibraryMediaFilterControlProps {
  value: CatalogMediaFilter;
  onChange: (value: CatalogMediaFilter) => void;
}

export function LibraryMediaFilterControl({ value, onChange }: LibraryMediaFilterControlProps) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {FILTERS.map((filter) => {
        const selected = value === filter.value;

        return (
          <Pressable
            key={filter.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`Filter ${filter.label}`}
            onPress={() => onChange(filter.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <AppText
              variant="caption"
              style={[styles.label, selected && styles.labelSelected]}
            >
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
    gap: spacing.xs,
    paddingTop: spacing.xs,
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
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
