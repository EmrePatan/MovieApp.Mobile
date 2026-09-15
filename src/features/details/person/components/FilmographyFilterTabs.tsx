import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export type FilmographyFilter = 'all' | 'movies' | 'tv';

const FILTERS: { id: FilmographyFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'movies', label: 'Movies' },
  { id: 'tv', label: 'TV' },
];

interface FilmographyFilterTabsProps {
  activeFilter: FilmographyFilter;
  onFilterChange: (filter: FilmographyFilter) => void;
}

export function FilmographyFilterTabs({
  activeFilter,
  onFilterChange,
}: FilmographyFilterTabsProps) {
  return (
    <View style={styles.container} testID="filmography-filter-tabs">
      {FILTERS.map((filter) => {
        const active = filter.id === activeFilter;

        return (
          <Pressable
            key={filter.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onFilterChange(filter.id)}
            style={[styles.tab, active && styles.tabActive]}
            testID={`filmography-filter-${filter.id}`}
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
