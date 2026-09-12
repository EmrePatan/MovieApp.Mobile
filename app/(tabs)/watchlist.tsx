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
import { isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { useAuth } from '@/auth/useAuth';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { CreateWatchlistModal } from '@/features/watchlists/components/CreateWatchlistModal';
import { LibraryContentCard } from '@/features/watchlists/components/LibraryContentCard';
import { WatchlistEmptyState } from '@/features/watchlists/components/WatchlistEmptyState';
import { WatchlistLoadingState } from '@/features/watchlists/components/WatchlistLoadingState';
import { WatchlistSelector } from '@/features/watchlists/components/WatchlistSelector';
import {
  useDeleteWatchlistMutation,
  useRemoveWatchlistItemMutation,
} from '@/features/watchlists/hooks/useWatchlistMutations';
import { useWatchlistItems } from '@/features/watchlists/hooks/useWatchlistItems';
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists';
import { flattenWatchlistPages, type LibraryItem } from '@/features/watchlists/utils/library-items';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function WatchlistScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
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

  const handleSelectWatchlist = useCallback((watchlistId: string) => {
    setSelectedWatchlistId(watchlistId);
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

      const itemKey = `${item.type}-${item.id}`;
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
        isRemoving={removingItemKey === `${item.type}-${item.id}`}
        onPress={handleItemPress}
        onRemove={handleRemoveItem}
      />
    ),
    [handleItemPress, handleRemoveItem, removingItemKey],
  );

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
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <AppText variant="title">Watchlist</AppText>
        </View>
        <WatchlistEmptyState
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
        <WatchlistLoadingState />
      </SafeAreaView>
    );
  }

  if (watchlistsQuery.isError && watchlists.length === 0) {
    const message = isApiError(watchlistsQuery.error)
      ? watchlistsQuery.error.userMessage
      : 'Unable to load watchlists. Please try again.';

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message={message}
            onRetry={() => void watchlistsQuery.refetch()}
            retryLabel="Try Again"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (watchlists.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <WatchlistEmptyState
          title="You don't have any watchlists yet."
          actionLabel="Create Watchlist"
          onAction={() => setCreateModalVisible(true)}
        />
        <CreateWatchlistModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onCreated={handleCreatedWatchlist}
        />
      </SafeAreaView>
    );
  }

  if (itemsQuery.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <WatchlistLoadingState />
        <CreateWatchlistModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onCreated={handleCreatedWatchlist}
        />
      </SafeAreaView>
    );
  }

  if (itemsQuery.isError && items.length === 0) {
    const message = isApiError(itemsQuery.error)
      ? itemsQuery.error.userMessage
      : 'Unable to load watchlist items. Please try again.';

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message={message}
            onRetry={() => void itemsQuery.refetch()}
            retryLabel="Try Again"
          />
        </View>
        <CreateWatchlistModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onCreated={handleCreatedWatchlist}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <WatchlistEmptyState
            title="This watchlist is empty."
            message="Add movies and TV shows from their detail pages."
          />
        }
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
      />
      <CreateWatchlistModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreated={handleCreatedWatchlist}
      />
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
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
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
    paddingHorizontal: spacing.lg,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
