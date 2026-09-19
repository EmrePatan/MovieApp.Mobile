import type { SearchTypeFilter } from '../types';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const FILTERS: SearchTypeFilter[] = ['all', 'movie', 'tv', 'person'];

function getFilterLabel(filter: SearchTypeFilter, t: (key: string) => string): string {
  if (filter === 'all') {
    return t('search.filter.all');
  }

  if (filter === 'movie') {
    return t('search.filter.movies');
  }

  if (filter === 'tv') {
    return t('search.filter.tvShows');
  }

  return t('search.filter.people');
}

interface SearchFilterControlProps {
  value: SearchTypeFilter;
  onChange: (value: SearchTypeFilter) => void;
}

export function SearchFilterControl({ value, onChange }: SearchFilterControlProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {FILTERS.map((filter) => {
        const selected = value === filter;
        const label = getFilterLabel(filter, t);

        return (
          <Pressable
            key={filter}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t('search.filter.filterAccessibility', { label })}
            onPress={() => onChange(filter)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <AppText
              variant="caption"
              style={[styles.label, selected && styles.labelSelected]}
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
