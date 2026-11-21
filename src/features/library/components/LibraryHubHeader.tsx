import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import type { CatalogMediaFilter } from '../types';
import type { LibraryCategory } from '../types/library';
import { LibraryCategoryControl } from './LibraryCategoryControl';
import { LibraryInlineSearchInput } from './LibraryInlineSearchInput';
import { LibraryMediaFilterControl } from './LibraryMediaFilterControl';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface LibraryHubHeaderProps {
  category: LibraryCategory;
  mediaType: CatalogMediaFilter;
  onCategoryChange: (value: LibraryCategory) => void;
  onMediaTypeChange: (value: CatalogMediaFilter) => void;
  searchOpen: boolean;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
}

export const LibraryHubHeader = memo(function LibraryHubHeader({
  category,
  mediaType,
  onCategoryChange,
  onMediaTypeChange,
  searchOpen,
  searchInput,
  onSearchChange,
  onClearSearch,
  onOpenSearch,
  onCloseSearch,
}: LibraryHubHeaderProps) {
  const { t } = useTranslation();
  const isWatchlistsCategory = category === 'watchlist';

  if (searchOpen) {
    return (
      <View style={styles.header} testID="library-hub-header">
        <LibraryInlineSearchInput
          value={searchInput}
          onChangeText={onSearchChange}
          onClear={onClearSearch}
          onCancel={onCloseSearch}
          autoFocus
        />
      </View>
    );
  }

  return (
    <View style={styles.header} testID="library-hub-header">
      <View style={styles.categoryRow}>
        <View style={styles.categories}>
          <LibraryCategoryControl value={category} onChange={onCategoryChange} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('library.hub.searchPlaceholder')}
          onPress={onOpenSearch}
          hitSlop={8}
          style={({ pressed }) => [styles.searchIcon, pressed && styles.pressed]}
        >
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
      {category !== 'watching' && !isWatchlistsCategory ? (
        <LibraryMediaFilterControl value={mediaType} onChange={onMediaTypeChange} />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  categories: {
    flex: 1,
    minWidth: 0,
  },
  searchIcon: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.85,
  },
});
