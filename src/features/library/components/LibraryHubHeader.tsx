import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory } from '../types/library';
import { LibraryCategoryControl } from './LibraryCategoryControl';
import { LibraryMediaFilterControl } from './LibraryMediaFilterControl';
import { spacing } from '@/theme/spacing';

interface LibraryHubHeaderProps {
  category: LibraryCategory;
  mediaType: CatalogMediaFilter;
  onCategoryChange: (value: LibraryCategory) => void;
  onMediaTypeChange: (value: CatalogMediaFilter) => void;
}

export const LibraryHubHeader = memo(function LibraryHubHeader({
  category,
  mediaType,
  onCategoryChange,
  onMediaTypeChange,
}: LibraryHubHeaderProps) {
  const isWatchlistsCategory = category === 'watchlist';

  return (
    <View style={styles.header} testID="library-hub-header">
      <AppText variant="title" accessibilityRole="header">
        My Library
      </AppText>
      <AppText variant="bodySmall" muted>
        Your personal collection
      </AppText>
      <LibraryCategoryControl value={category} onChange={onCategoryChange} />
      {category !== 'watching' && !isWatchlistsCategory ? (
        <LibraryMediaFilterControl value={mediaType} onChange={onMediaTypeChange} />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
