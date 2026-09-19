import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const isWatchlistsCategory = category === 'watchlist';

  return (
    <View style={styles.header} testID="library-hub-header">
      <AppText variant="title" accessibilityRole="header">
        {t('library.hub.title')}
      </AppText>
      <AppText variant="bodySmall" muted>
        {t('library.hub.subtitle')}
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
