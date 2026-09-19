import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { GalleryFilter } from '../types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface GalleryFilterTabsProps {
  activeFilter: GalleryFilter;
  onFilterChange: (filter: GalleryFilter) => void;
}

export function GalleryFilterTabs({ activeFilter, onFilterChange }: GalleryFilterTabsProps) {
  const { t } = useTranslation();
  const filters = useMemo(
    () =>
      [
        { id: 'all' as const, label: t('gallery.filters.all') },
        { id: 'backdrops' as const, label: t('gallery.filters.backdrops') },
        { id: 'posters' as const, label: t('gallery.filters.posters') },
      ] satisfies { id: GalleryFilter; label: string }[],
    [t],
  );

  return (
    <View style={styles.container} testID="gallery-filter-tabs">
      {filters.map((filter) => {
        const active = filter.id === activeFilter;

        return (
          <Pressable
            key={filter.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onFilterChange(filter.id)}
            style={[styles.tab, active && styles.tabActive]}
            testID={`gallery-filter-${filter.id}`}
          >
            <AppText variant="caption" style={[styles.tabLabel, active && styles.tabLabelActive]}>
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
    marginBottom: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
});
