import type { HomeTypeFilter } from '../types';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

const FILTERS: HomeTypeFilter[] = ['all', 'movie', 'tv'];

interface HomeTypeFilterControlProps {
  value: HomeTypeFilter;
  onChange: (value: HomeTypeFilter) => void;
  overlay?: boolean;
}

function getFilterLabel(
  filter: HomeTypeFilter,
  t: (key: string) => string,
): string {
  if (filter === 'all') {
    return t('home.typeFilter.all');
  }

  if (filter === 'movie') {
    return t('home.typeFilter.movies');
  }

  return t('home.typeFilter.tvShows');
}

export function HomeTypeFilterControl({
  value,
  onChange,
  overlay = false,
}: HomeTypeFilterControlProps) {
  const { t } = useTranslation();

  return (
    <View
      style={[styles.container, overlay && styles.containerOverlay]}
      accessibilityRole="tablist"
    >
      {FILTERS.map((filter) => {
        const selected = value === filter;
        const label = getFilterLabel(filter, t);

        return (
          <Pressable
            key={filter}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t('home.typeFilter.showFilter', { label })}
            onPress={() => onChange(filter)}
            style={[
              styles.chip,
              overlay && styles.chipOverlay,
              selected && styles.chipSelected,
              selected && overlay && styles.chipSelectedOverlay,
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.label,
                overlay && styles.labelOverlay,
                selected && styles.labelSelected,
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
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  containerOverlay: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOverlay: {
    minHeight: 32,
    paddingHorizontal: spacing.sm + 2,
    backgroundColor: 'rgba(20, 20, 28, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipSelectedOverlay: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelOverlay: {
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
