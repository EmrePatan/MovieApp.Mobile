import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { CatalogMediaFilter } from '../types';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

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
    alignItems: 'center',
    gap: spacing.lg,
  },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
  },
  chipSelected: {},
  label: {
    color: premiumSheet.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  labelSelected: {
    color: premiumSheet.mutedGold,
    fontWeight: '700',
  },
});

