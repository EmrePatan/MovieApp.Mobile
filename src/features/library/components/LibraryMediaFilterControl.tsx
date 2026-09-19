import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { CatalogMediaFilter } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const FILTER_VALUES: CatalogMediaFilter[] = ['all', 'movie', 'tv'];

interface LibraryMediaFilterControlProps {
  value: CatalogMediaFilter;
  onChange: (value: CatalogMediaFilter) => void;
}

export function LibraryMediaFilterControl({ value, onChange }: LibraryMediaFilterControlProps) {
  const { t } = useTranslation();
  const filters = useMemo(
    () =>
      FILTER_VALUES.map((filterValue) => ({
        value: filterValue,
        label: t(`library.mediaFilter.${filterValue}`),
      })),
    [t],
  );

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {filters.map((filter) => {
        const selected = value === filter.value;

        return (
          <Pressable
            key={filter.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t('common.filterLabel', { label: filter.label })}
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
