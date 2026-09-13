import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { useAuth } from '@/auth/useAuth';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { LibraryContentCard } from '@/features/library/components/LibraryContentCard';
import { LibraryEmptyState } from '@/features/library/components/LibraryEmptyState';
import { LibraryLoadingState } from '@/features/library/components/LibraryLoadingState';
import { LibrarySortControl } from '@/features/library/components/LibrarySortControl';
import { useLibraryDisplayItems } from '@/features/library/hooks/useLibraryDisplayItems';
import { getLibraryItemKey } from '@/features/library/utils/library-item-key';
import { getAvailableSortOptions } from '@/features/library/utils/library-sort';
import type { LibrarySortOption, LibraryTypeFilter } from '@/features/library/types';
import { SearchFilterControl } from '@/features/search/components/SearchFilterControl';
import { CreateWatchlistModal } from '@/features/watchlists/components/CreateWatchlistModal';
import { WatchlistSelector } from '@/features/watchlists/components/WatchlistSelector';
import {
  useDeleteWatchlistMutation,
  useRemoveWatchlistItemMutation,
} from '@/features/watchlists/hooks/useWatchlistMutations';
import { useWatchlistItems } from '@/features/watchlists/hooks/useWatchlistItems';
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists';
import { flattenWatchlistPages, type LibraryItem } from '@/features/watchlists/utils/library-items';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const WATCHLIST_SORT_OPTIONS = getAvailableSortOptions(true);
const DEFAULT_WATCHLIST_SORT: LibrarySortOption = 'recentlyAdded';

export default function WatchlistScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [typeFilter, setTypeFilter] = useState<LibraryTypeFilter>('all');
  const [sort, setSort] = useState<LibrarySortOption>(DEFAULT_WATCHLIST_SORT);
  const [removingItemKey, setRemovingItemKey] = useState<string | null>(null);

  const watchlistsQuery = useWatchlists(isAuthenticated);
  const itemsQuery = useWatchlistItems(selectedWatchlistId);
  const deleteWatchlist = useDeleteWatchlistMutation();
  const removeItem = useRemoveWatchlistItemMutation(selectedWatchlistId);

  const watchlists = useMemo(
    () => watchlistsQuery.data ?? [],
    [watchlistsQuery.data],
  );
  const selectedWatchlist = useMemo(
    () => watchlists.find((watchlist) => watchlist.id === selectedWatchlistId) ?? null,
    [selectedWatchlistId, watchlists],
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

  useEffect(() => {
    if (!isAuthenticated || watchlists.length === 0) {
      if (selectedWatchlistId !== null) {
        setSelectedWatchlistId(null);
      }
      return;
    }

    const selectedExists = watchlists.some((watchlist) => watchlist.id === selectedWatchlistId);
    if (!selectedWatchlistId || !selectedExists) {
      const nextWatchlistId = watchlists[0]?.id ?? null;
      if (nextWatchlistId !== selectedWatchlistId) {
        setSelectedWatchlistId(nextWatchlistId);
      }
    }
  }, [isAuthenticated, selectedWatchlistId, watchlists]);

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleBrowse = useCallback(() => {
    router.push('/(tabs)/search');
  }, [router]);

  const handleSelectWatchlist = useCallback((watchlistId: string) => {
    setSelectedWatchlistId(watchlistId);
    setTypeFilter('all');
    setSort(DEFAULT_WATCHLIST_SORT);
  }, []);

  const handleCreatedWatchlist = useCallback((watchlistId: string) => {
    setSelectedWatchlistId(watchlistId);
    void watchlistsQuery.refetch();
  }, [watchlistsQuery]);

  const handleDeleteWatchlist = useCallback(() => {
    if (!selectedWatchlist) {
      return;
    }

    Alert.alert(
      'Delete watchlist',
      `Delete "${selectedWatchlist.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteWatchlist.mutate(selectedWatchlist.id, {
              onSuccess: () => {
                const remaining = watchlists.filter(
                  (watchlist) => watchlist.id !== selectedWatchlist.id,
                );
                setSelectedWatchlistId(remaining[0]?.id ?? null);
              },
            });
          },
        },
      ],
    );
  }, [deleteWatchlist, selectedWatchlist, watchlists]);

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
        removeIcon="bookmark"
        removeAccessibilityLabel="watchlist"
        onPress={handleItemPress}
        onRemove={handleRemoveItem}
      />
    ),
    [handleItemPress, handleRemoveItem, removingItemKey],
  );

  const listControls = items.length > 0 ? (
    <View style={styles.controls}>
      <SearchFilterControl value={typeFilter} onChange={setTypeFilter} />
      <LibrarySortControl
        value={sort}
        options={WATCHLIST_SORT_OPTIONS}
        onChange={setSort}
      />
    </View>
  ) : null;

  const listHeader = (
    <View style={styles.header}>
      <AppText variant="title">Watchlist</AppText>
      <WatchlistSelector
        watchlists={watchlists}
        selectedWatchlistId={selectedWatchlistId}
        isLoading={watchlistsQuery.isLoading}
        isError={watchlistsQuery.isError}
        onSelect={handleSelectWatchlist}
        onCreatePress={() => setCreateModalVisible(true)}
        onRetry={() => void watchlistsQuery.refetch()}
      />
      {selectedWatchlist ? (
        <View style={styles.selectedHeader}>
          <View style={styles.selectedMeta}>
            <AppText variant="subtitle">{selectedWatchlist.name}</AppText>
            <AppText variant="caption" muted>
              {selectedWatchlist.itemCount} items
            </AppText>
          </View>
          <AppButton
            title="Delete"
            variant="ghost"
            loading={deleteWatchlist.isPending}
            disabled={deleteWatchlist.isPending}
            onPress={handleDeleteWatchlist}
          />
        </View>
      ) : null}
      {listControls}
    </View>
  );

  const createModal = (
    <CreateWatchlistModal
      visible={createModalVisible}
      onClose={() => setCreateModalVisible(false)}
      onCreated={handleCreatedWatchlist}
    />
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <AppText variant="title">Watchlist</AppText>
        </View>
        <LibraryEmptyState
          icon="bookmark"
          title="Sign in to manage your watchlists"
          message="Your personal lists will appear here after you sign in."
          actionLabel="Sign In"
          onAction={handleSignIn}
        />
      </SafeAreaView>
    );
  }

  if (watchlistsQuery.isLoading && watchlists.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel="Loading watchlists" />
        {createModal}
      </SafeAreaView>
    );
  }

  if (watchlistsQuery.isError && watchlists.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message="Unable to load watchlists. Please try again."
            onRetry={() => void watchlistsQuery.refetch()}
            retryLabel="Try Again"
          />
        </View>
        {createModal}
      </SafeAreaView>
    );
  }

  if (watchlists.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <LibraryEmptyState
          icon="bookmark"
          title="You don't have any watchlists yet"
          message="Create a list to save movies and TV shows you want to watch."
          actionLabel="Create Watchlist"
          onAction={() => setCreateModalVisible(true)}
        />
        {createModal}
      </SafeAreaView>
    );
  }

  if (itemsQuery.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel="Loading watchlist items" />
        {createModal}
      </SafeAreaView>
    );
  }

  if (itemsQuery.isError && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message="Unable to load watchlist items. Please try again."
            onRetry={() => void itemsQuery.refetch()}
            retryLabel="Try Again"
          />
        </View>
        {createModal}
      </SafeAreaView>
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
        title="Your watchlist is empty"
        message="Add movies and TV shows from their detail pages, or browse to discover something new."
        actionLabel="Browse"
        onAction={handleBrowse}
      />
    ) : (
      <LibraryEmptyState
        icon="bookmark"
        title={filteredEmptyTitle}
        message="Try a different filter or sort option."
      />
    );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
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
      {createModal}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  controls: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xs,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.sm,
  },
  selectedMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
