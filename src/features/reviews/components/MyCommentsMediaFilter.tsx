import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { CatalogMediaFilter } from '@/features/library/types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const FILTER_VALUES: CatalogMediaFilter[] = ['all', 'movie', 'tv'];

interface MyCommentsMediaFilterProps {
  value: CatalogMediaFilter;
  onChange: (value: CatalogMediaFilter) => void;
}

export function MyCommentsMediaFilter({ value, onChange }: MyCommentsMediaFilterProps) {
  const { t } = useTranslation();
  const filters = useMemo(
    () =>
      FILTER_VALUES.map((filterValue) => ({
        value: filterValue,
        label: t(`profile.myComments.filters.${filterValue}`),
      })),
    [t],
  );

  return (
    <View style={styles.shell} accessibilityRole="tablist">
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
  shell: {
    width: '100%',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  chip: {
    flex: 1,
    minHeight: 34,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.accentSurface,
    borderColor: colors.borderAccent,
  },
  label: {
    color: colors.textMuted,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 16,
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
