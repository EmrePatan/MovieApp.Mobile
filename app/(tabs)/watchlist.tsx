import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { getLibraryItemKey } from '@/features/library/utils/library-item-key';
import { getAvailableSortOptions } from '@/features/library/utils/library-sort';
import type { CatalogMediaFilter, LibrarySortOption } from '@/features/library/types';
import { LibraryMediaFilterControl } from '@/features/library/components/LibraryMediaFilterControl';
import { CreateWatchlistModal } from '@/features/watchlists/components/CreateWatchlistModal';
import { WatchlistSelector } from '@/features/watchlists/components/WatchlistSelector';
import {
  useDeleteWatchlistMutation,
  useRemoveWatchlistItemMutation,
} from '@/features/watchlists/hooks/useWatchlistMutations';
import { useStableFetchedItems } from '@/features/library/hooks/useStableFetchedItems';
import { useWatchlistItems } from '@/features/watchlists/hooks/useWatchlistItems';
import { useWatchlists } from '@/features/watchlists/hooks/useWatchlists';
import { flattenWatchlistPages, type LibraryItem } from '@/features/watchlists/utils/library-items';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const WATCHLIST_SORT_OPTIONS = getAvailableSortOptions(true);
const DEFAULT_WATCHLIST_SORT: LibrarySortOption = 'recentlyAdded';

export default function WatchlistScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [userSelectedWatchlistId, setUserSelectedWatchlistId] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [typeFilter, setTypeFilter] = useState<CatalogMediaFilter>('all');
  const [sort, setSort] = useState<LibrarySortOption>(DEFAULT_WATCHLIST_SORT);
  const [removingItemKey, setRemovingItemKey] = useState<string | null>(null);

  const watchlistsQuery = useWatchlists(isAuthenticated);

  const watchlists = useMemo(
    () => watchlistsQuery.data ?? [],
    [watchlistsQuery.data],
  );

  const selectedWatchlistId = useMemo(() => {
    if (!isAuthenticated || watchlists.length === 0) {
      return null;
    }

    if (
      userSelectedWatchlistId &&
      watchlists.some((watchlist) => watchlist.id === userSelectedWatchlistId)
    ) {
      return userSelectedWatchlistId;
    }

    return watchlists[0]?.id ?? null;
  }, [isAuthenticated, userSelectedWatchlistId, watchlists]);

  const itemsQuery = useWatchlistItems(selectedWatchlistId, { mediaType: typeFilter, sort });
  const deleteWatchlist = useDeleteWatchlistMutation();
  const removeItem = useRemoveWatchlistItemMutation(selectedWatchlistId);

  const selectedWatchlist = useMemo(
    () => watchlists.find((watchlist) => watchlist.id === selectedWatchlistId) ?? null,
    [selectedWatchlistId, watchlists],
  );

  const items = useMemo(
    () => flattenWatchlistPages(itemsQuery.data?.pages ?? []),
    [itemsQuery.data?.pages],
  );
  const displayItems = useStableFetchedItems(
    items,
    itemsQuery.isFetching,
    selectedWatchlistId ?? 'none',
  );

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleBrowse = useCallback(() => {
    router.push('/search');
  }, [router]);

  const handleSelectWatchlist = useCallback((watchlistId: string) => {
    setUserSelectedWatchlistId(watchlistId);
    setTypeFilter('all');
    setSort(DEFAULT_WATCHLIST_SORT);
  }, []);

  const handleCreatedWatchlist = useCallback((watchlistId: string) => {
    setUserSelectedWatchlistId(watchlistId);
    void watchlistsQuery.refetch();
  }, [watchlistsQuery]);

  const handleDeleteWatchlist = useCallback(() => {
    if (!selectedWatchlist) {
      return;
    }

    Alert.alert(
      t('watchlists.optionsSheet.confirmTitle'),
      t('watchlists.optionsSheet.confirmMessage', { name: selectedWatchlist.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteWatchlist.mutate(selectedWatchlist.id, {
              onSuccess: () => {
                const remaining = watchlists.filter(
                  (watchlist) => watchlist.id !== selectedWatchlist.id,
                );
                setUserSelectedWatchlistId(remaining[0]?.id ?? null);
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

  const renderItem = useCallback(
    ({ item }: { item: LibraryItem }) => (
      <LibraryContentCard
        item={item}
        isRemoving={removingItemKey === getLibraryItemKey(item)}
        removeIcon="bookmark"
        removeAccessibilityLabel={t('common.watchlist')}
        onPress={handleItemPress}
        onRemove={handleRemoveItem}
      />
    ),
    [handleItemPress, handleRemoveItem, removingItemKey],
  );

  const listControls = (
    <View style={styles.controls}>
      <LibraryMediaFilterControl value={typeFilter} onChange={setTypeFilter} />
      <LibrarySortControl
        value={sort}
        options={WATCHLIST_SORT_OPTIONS}
        onChange={setSort}
      />
    </View>
  );

  const listHeader = (
    <View style={styles.header}>
      <AppText variant="title">{t('common.watchlist')}</AppText>
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
            title={t('common.delete')}
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
          <AppText variant="title">{t('common.watchlist')}</AppText>
        </View>
        <LibraryEmptyState
          icon="bookmark"
          title={t('library.hub.title')}
          message={t('library.hub.signInCopy')}
          actionLabel={t('common.signInTitleCase')}
          onAction={handleSignIn}
        />
      </SafeAreaView>
    );
  }

  if (watchlistsQuery.isLoading && watchlists.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel={t('common.loadingWatchlists')} />
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
            message={t('library.watchlistsOverview.loadError')}
            onRetry={() => void watchlistsQuery.refetch()}
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
          title={t('library.watchlistsOverview.emptyTitle')}
          message={t('library.watchlistsOverview.emptyMessage')}
          actionLabel={t('common.createWatchlist')}
          onAction={() => setCreateModalVisible(true)}
        />
        {createModal}
      </SafeAreaView>
    );
  }

  if (itemsQuery.isLoading && displayItems.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel={t('common.loadingWatchlistItems')} />
        {createModal}
      </SafeAreaView>
    );
  }

  if (itemsQuery.isError && displayItems.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message={t('library.watchlistDetail.loadError')}
            onRetry={() => void itemsQuery.refetch()}
          />
        </View>
        {createModal}
      </SafeAreaView>
    );
  }

  const filteredEmptyTitle =
    typeFilter === 'movie'
      ? t('library.watchlistDetail.filteredEmpty.movies')
      : typeFilter === 'tv'
        ? t('library.watchlistDetail.filteredEmpty.tvShows')
        : t('library.watchlistDetail.filteredEmpty.all');

  const emptyComponent =
    displayItems.length === 0 ? (
      <LibraryEmptyState
        icon="bookmark"
        title={t('library.watchlistDetail.emptyTitle')}
        message={t('library.watchlistDetail.emptyMessage')}
        actionLabel={t('common.explore')}
        onAction={handleBrowse}
      />
    ) : (
      <LibraryEmptyState
        icon="bookmark"
        title={filteredEmptyTitle}
        message={t('library.watchlistDetail.filteredEmpty.message')}
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
