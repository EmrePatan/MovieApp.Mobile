import { StyleSheet, View } from 'react-native';
import type { CatalogMediaFilter, LibrarySortOption } from '../types';
import { LibraryMediaFilterControl } from './LibraryMediaFilterControl';
import { LibrarySortControl } from './LibrarySortControl';
import { spacing } from '@/theme/spacing';

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
    <View style={styles.container}>
      <LibraryMediaFilterControl value={typeFilter} onChange={onTypeFilterChange} />
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
  container: {
    gap: spacing.sm,
  },
});
