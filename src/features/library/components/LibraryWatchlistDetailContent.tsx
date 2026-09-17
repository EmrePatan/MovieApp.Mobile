import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ErrorView } from '@/components/common/ErrorView';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { RenameWatchlistModal } from '@/features/watchlists/components/RenameWatchlistModal';
import { WatchlistListOptionsSheet } from '@/features/watchlists/components/WatchlistListOptionsSheet';
import { useDeleteWatchlistMutation, useRemoveWatchlistItemMutation } from '@/features/watchlists/hooks/useWatchlistMutations';
import { useStableFetchedItems } from '../hooks/useStableFetchedItems';
import { useWatchlistItems } from '@/features/watchlists/hooks/useWatchlistItems';
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists';
import { flattenWatchlistPages } from '@/features/watchlists/utils/library-items';
import type { CatalogMediaFilter, LibrarySortOption } from '../types';
import type { LibraryItem as GridLibraryItem } from '../types/library';
import { getLibraryGridItemKey } from '../utils/library-item-key';
import { mapWatchlistItemToLibraryGridItem } from '../utils/map-watchlist-item-to-grid-item';
import { getAvailableSortOptions } from '../utils/library-sort';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryGridCard } from './LibraryGridCard';
import { LibraryLoadingState } from './LibraryLoadingState';
import { LibraryWatchlistDetailHeader } from './LibraryWatchlistDetailHeader';
import { LibraryWatchlistListControls } from './LibraryWatchlistListControls';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const WATCHLIST_SORT_OPTIONS = getAvailableSortOptions(true);
const DEFAULT_WATCHLIST_SORT: LibrarySortOption = 'recentlyAdded';
const GRID_COLUMNS = 3;
const GRID_GAP = spacing.sm;

interface LibraryWatchlistDetailContentProps {
  watchlistId: string;
}

export function LibraryWatchlistDetailContent({
  watchlistId,
}: LibraryWatchlistDetailContentProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [typeFilter, setTypeFilter] = useState<CatalogMediaFilter>('all');
  const [sort, setSort] = useState<LibrarySortOption>(DEFAULT_WATCHLIST_SORT);
  const watchlistsQuery = useWatchlists();
  const itemsQuery = useWatchlistItems(watchlistId, { mediaType: typeFilter, sort });
  const deleteWatchlist = useDeleteWatchlistMutation();
  const removeItem = useRemoveWatchlistItemMutation(watchlistId);
  const [removingItemKey, setRemovingItemKey] = useState<string | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [optionsSheetVisible, setOptionsSheetVisible] = useState(false);

  const watchlist = useMemo(
    () => watchlistsQuery.data?.find((entry) => entry.id === watchlistId) ?? null,
    [watchlistId, watchlistsQuery.data],
  );

  const items = useMemo(
    () => flattenWatchlistPages(itemsQuery.data?.pages ?? []),
    [itemsQuery.data?.pages],
  );
  const stableItems = useStableFetchedItems(items, itemsQuery.isFetching, watchlistId);

  const gridItems = useMemo(
    () => stableItems.map(mapWatchlistItemToLibraryGridItem),
    [stableItems],
  );

  const itemWidth = useMemo(
    () => (width - spacing.lg * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
    [width],
  );
  const itemHeight = itemWidth / layout.posterAspectRatio;

  const handleDeleteWatchlist = useCallback(() => {
    if (!watchlist) {
      return;
    }

    deleteWatchlist.mutate(watchlist.id, {
      onSuccess: () => {
        setOptionsSheetVisible(false);
        router.back();
      },
    });
  }, [deleteWatchlist, router, watchlist]);

  const handleOverflowPress = useCallback(() => {
    if (!watchlist) {
      return;
    }

    setOptionsSheetVisible(true);
  }, [watchlist]);

  const handleItemPress = useCallback(
    (item: GridLibraryItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  const handleRemoveItem = useCallback(
    (item: GridLibraryItem) => {
      if (removeItem.isPending) {
        return;
      }

      const itemKey = getLibraryGridItemKey(item);
      setRemovingItemKey(itemKey);
      removeItem.mutate(
        { contentType: item.type, contentId: item.id },
        {
          onSettled: () => {
            setRemovingItemKey(null);
          },
        },
      );
    },
    [removeItem],
  );

  const handleLoadMore = useCallback(() => {
    if (
      !itemsQuery.hasNextPage ||
      itemsQuery.isFetchingNextPage ||
      itemsQuery.isFetching
    ) {
      return;
    }

    void itemsQuery.fetchNextPage();
  }, [itemsQuery]);

  const renderItem = useCallback(
    ({ item }: { item: GridLibraryItem }) => (
      <LibraryGridCard
        item={item}
        category="watchlist"
        width={itemWidth}
        height={itemHeight}
        isRemoving={removingItemKey === getLibraryGridItemKey(item)}
        removeAccessibilityLabel="this list"
        onPress={handleItemPress}
        onRemove={handleRemoveItem}
      />
    ),
    [handleItemPress, handleRemoveItem, itemHeight, itemWidth, removingItemKey],
  );

  const listControls = (
    <LibraryWatchlistListControls
      typeFilter={typeFilter}
      onTypeFilterChange={setTypeFilter}
      sort={sort}
      sortOptions={WATCHLIST_SORT_OPTIONS}
      onSortChange={setSort}
    />
  );

  const listHeader = (
    <LibraryWatchlistDetailHeader
      title={watchlist?.name ?? 'Watchlist'}
      onOverflowPress={watchlist ? handleOverflowPress : undefined}
    >
      {listControls}
    </LibraryWatchlistDetailHeader>
  );

  const watchlistModals = (
    <>
      <WatchlistListOptionsSheet
        visible={optionsSheetVisible}
        listName={watchlist?.name ?? ''}
        deleteLoading={deleteWatchlist.isPending}
        onClose={() => setOptionsSheetVisible(false)}
        onRename={() => setRenameModalVisible(true)}
        onConfirmDelete={handleDeleteWatchlist}
      />
      <RenameWatchlistModal
        visible={renameModalVisible}
        watchlistId={watchlist?.id ?? null}
        initialName={watchlist?.name ?? ''}
        onClose={() => setRenameModalVisible(false)}
      />
    </>
  );

  if (itemsQuery.isLoading && stableItems.length === 0) {
    return (
      <View style={styles.screen}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel="Loading watchlist items" />
        {watchlistModals}
      </View>
    );
  }

  if (itemsQuery.isError && stableItems.length === 0) {
    return (
      <View style={styles.screen}>
        {listHeader}
        <View style={styles.centered}>
          <ErrorView
            message="Unable to load watchlist items. Please try again."
            onRetry={() => void itemsQuery.refetch()}
            retryLabel="Try Again"
          />
        </View>
        {watchlistModals}
      </View>
    );
  }

  const filteredEmptyTitle =
    typeFilter === 'movie'
      ? 'No movies match this filter'
      : typeFilter === 'tv'
        ? 'No TV shows match this filter'
        : 'No items match this filter';

  const emptyComponent =
    stableItems.length === 0 ? (
      <LibraryEmptyState
        icon="bookmark"
        title="This watchlist is empty"
        message="Add movies and TV shows from their detail pages."
        actionLabel="Browse Discover"
        onAction={() => router.push('/(tabs)/discover')}
      />
    ) : (
      <LibraryEmptyState
        icon="bookmark"
        title={filteredEmptyTitle}
        message="Try a different filter or sort option."
      />
    );

  return (
    <>
      <FlatList
      testID="library-watchlist-detail"
      data={gridItems}
      keyExtractor={getLibraryGridItemKey}
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.row}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={emptyComponent}
      ListFooterComponent={
        itemsQuery.isFetchingNextPage ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : null
      }
      contentContainerStyle={styles.listContent}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      initialNumToRender={layout.verticalList.initialNumToRender * GRID_COLUMNS}
      maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch * GRID_COLUMNS}
      windowSize={layout.verticalList.windowSize}
      />
      {watchlistModals}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: GRID_GAP,
  },
  row: {
    gap: GRID_GAP,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
