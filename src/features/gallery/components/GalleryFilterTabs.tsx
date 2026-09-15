import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { GalleryFilter } from '../types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const FILTERS: { id: GalleryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'backdrops', label: 'Backdrops' },
  { id: 'posters', label: 'Posters' },
];

interface GalleryFilterTabsProps {
  activeFilter: GalleryFilter;
  onFilterChange: (filter: GalleryFilter) => void;
}

export function GalleryFilterTabs({ activeFilter, onFilterChange }: GalleryFilterTabsProps) {
  return (
    <View style={styles.container} testID="gallery-filter-tabs">
      {FILTERS.map((filter) => {
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
