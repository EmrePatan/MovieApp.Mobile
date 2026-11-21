import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { CatalogMediaFilter } from '@/features/library/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

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
            style={[styles.tab, selected && styles.tabSelected]}
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
    alignItems: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -StyleSheet.hairlineWidth,
  },
  tabSelected: {
    borderBottomColor: colors.textPrimary,
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
