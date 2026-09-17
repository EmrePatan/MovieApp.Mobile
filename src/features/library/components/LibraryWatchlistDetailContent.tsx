import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ErrorView } from '@/components/common/ErrorView';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { useDeleteWatchlistMutation, useRemoveWatchlistItemMutation } from '@/features/watchlists/hooks/useWatchlistMutations';
import { useWatchlistItems } from '@/features/watchlists/hooks/useWatchlistItems';
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists';
import { flattenWatchlistPages, type LibraryItem } from '@/features/watchlists/utils/library-items';
import type { CatalogMediaFilter, LibrarySortOption } from '../types';
import { useLibraryDisplayItems } from '../hooks/useLibraryDisplayItems';
import { getLibraryItemKey } from '../utils/library-item-key';
import { getAvailableSortOptions } from '../utils/library-sort';
import { LibraryContentCard } from './LibraryContentCard';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryLoadingState } from './LibraryLoadingState';
import { LibraryMediaFilterControl } from './LibraryMediaFilterControl';
import { LibrarySortControl } from './LibrarySortControl';
import { LibraryWatchlistDetailHeader } from './LibraryWatchlistDetailHeader';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const WATCHLIST_SORT_OPTIONS = getAvailableSortOptions(true);
const DEFAULT_WATCHLIST_SORT: LibrarySortOption = 'recentlyAdded';

interface LibraryWatchlistDetailContentProps {
  watchlistId: string;
}

export function LibraryWatchlistDetailContent({
  watchlistId,
}: LibraryWatchlistDetailContentProps) {
  const router = useRouter();
  const watchlistsQuery = useWatchlists();
  const itemsQuery = useWatchlistItems(watchlistId);
  const deleteWatchlist = useDeleteWatchlistMutation();
  const removeItem = useRemoveWatchlistItemMutation(watchlistId);
  const [typeFilter, setTypeFilter] = useState<CatalogMediaFilter>('all');
  const [sort, setSort] = useState<LibrarySortOption>(DEFAULT_WATCHLIST_SORT);
  const [removingItemKey, setRemovingItemKey] = useState<string | null>(null);

  const watchlist = useMemo(
    () => watchlistsQuery.data?.find((entry) => entry.id === watchlistId) ?? null,
    [watchlistId, watchlistsQuery.data],
  );

  const items = useMemo(
    () => flattenWatchlistPages(itemsQuery.data?.pages ?? []),
    [itemsQuery.data?.pages],
  );

  const displayItems = useLibraryDisplayItems({
    items,
    typeFilter,
    sort,
  });

  const confirmDeleteWatchlist = useCallback(() => {
    if (!watchlist) {
      return;
    }

    Alert.alert(
      'Delete watchlist',
      `Delete "${watchlist.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteWatchlist.mutate(watchlist.id, {
              onSuccess: () => {
                router.back();
              },
            });
          },
        },
      ],
    );
  }, [deleteWatchlist, router, watchlist]);

  const handleOverflowPress = useCallback(() => {
    if (!watchlist) {
      return;
    }

    Alert.alert(
      watchlist.name,
      undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete List',
          style: 'destructive',
          onPress: confirmDeleteWatchlist,
        },
      ],
    );
  }, [confirmDeleteWatchlist, watchlist]);

  const handleItemPress = useCallback(
    (item: LibraryItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  const handleRemoveItem = useCallback(
    (item: LibraryItem) => {
      if (removeItem.isPending) {
        return;
      }

      const itemKey = getLibraryItemKey(item);
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

  const handleRefresh = useCallback(() => {
    void watchlistsQuery.refetch();
    void itemsQuery.refetch();
  }, [itemsQuery, watchlistsQuery]);

  const renderItem = useCallback(
    ({ item }: { item: LibraryItem }) => (
      <LibraryContentCard
        item={item}
        isRemoving={removingItemKey === getLibraryItemKey(item)}
        removeAccessibilityLabel="this list"
        removalMode="swipe"
        onPress={handleItemPress}
        onRemove={handleRemoveItem}
      />
    ),
    [handleItemPress, handleRemoveItem, removingItemKey],
  );

  const listControls = items.length > 0 ? (
    <View style={styles.controls}>
      <LibraryMediaFilterControl value={typeFilter} onChange={setTypeFilter} />
      <LibrarySortControl
        variant="menu"
        value={sort}
        options={WATCHLIST_SORT_OPTIONS}
        onChange={setSort}
      />
    </View>
  ) : null;

  const listHeader = (
    <LibraryWatchlistDetailHeader
      title={watchlist?.name ?? 'Watchlist'}
      subtitle={
        watchlist
          ? `${watchlist.itemCount} ${watchlist.itemCount === 1 ? 'title' : 'titles'}`
          : undefined
      }
      onOverflowPress={watchlist ? handleOverflowPress : undefined}
    >
      {listControls}
    </LibraryWatchlistDetailHeader>
  );

  if (itemsQuery.isLoading && items.length === 0) {
    return (
      <View style={styles.screen}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel="Loading watchlist items" />
      </View>
    );
  }

  if (itemsQuery.isError && items.length === 0) {
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
    items.length === 0 ? (
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
    <FlatList
      testID="library-watchlist-detail"
      data={displayItems}
      keyExtractor={getLibraryItemKey}
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
      refreshControl={
        <RefreshControl
          refreshing={
            (watchlistsQuery.isRefetching || itemsQuery.isRefetching) &&
            !itemsQuery.isFetchingNextPage
          }
          onRefresh={handleRefresh}
          tintColor={colors.accent}
        />
      }
      contentContainerStyle={styles.listContent}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      initialNumToRender={layout.verticalList.initialNumToRender}
      maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
      windowSize={layout.verticalList.windowSize}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  controls: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
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
