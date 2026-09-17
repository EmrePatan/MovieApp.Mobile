import { StyleSheet, View } from 'react-native';
import type { CatalogMediaFilter, LibrarySortOption } from '../types';
import { LibraryMediaFilterControl } from './LibraryMediaFilterControl';
import { LibrarySortControl } from './LibrarySortControl';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibraryWatchlistListControlsProps {
  typeFilter: CatalogMediaFilter;
  onTypeFilterChange: (value: CatalogMediaFilter) => void;
  sort: LibrarySortOption;
  sortOptions: LibrarySortOption[];
  onSortChange: (value: LibrarySortOption) => void;
}

export function LibraryWatchlistListControls({
  typeFilter,
  onTypeFilterChange,
  sort,
  sortOptions,
  onSortChange,
}: LibraryWatchlistListControlsProps) {
  return (
    <View style={styles.panel}>
      <LibraryMediaFilterControl value={typeFilter} onChange={onTypeFilterChange} />
      <View style={styles.divider} />
      <LibrarySortControl
        appearance="outlined"
        showLabel
        value={sort}
        options={sortOptions}
        onChange={onSortChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
});
