import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { useFavoritesItems } from '@/features/favorites/hooks/useFavoritesItems';
import { useRemoveFavoriteMutation } from '@/features/favorites/hooks/useFavoriteMutations';
import { flattenFavoritesPages } from '@/features/favorites/utils/favorite-library-items';
import { LibraryContentCard } from '@/features/library/components/LibraryContentCard';
import { LibraryEmptyState } from '@/features/library/components/LibraryEmptyState';
import { LibraryLoadingState } from '@/features/library/components/LibraryLoadingState';
import { LibrarySortControl } from '@/features/library/components/LibrarySortControl';
import { useLibraryDisplayItems } from '@/features/library/hooks/useLibraryDisplayItems';
import { getLibraryItemKey } from '@/features/library/utils/library-item-key';
import { getAvailableSortOptions } from '@/features/library/utils/library-sort';
import type { LibrarySortOption, LibraryTypeFilter } from '@/features/library/types';
import { SearchFilterControl } from '@/features/search/components/SearchFilterControl';
import type { LibraryItem } from '@/features/watchlists/utils/library-items';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const FAVORITES_SORT_OPTIONS = getAvailableSortOptions(false);
const DEFAULT_FAVORITES_SORT: LibrarySortOption = 'titleAsc';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const favoritesQuery = useFavoritesItems();
  const removeFavorite = useRemoveFavoriteMutation();
  const [typeFilter, setTypeFilter] = useState<LibraryTypeFilter>('all');
  const [sort, setSort] = useState<LibrarySortOption>(DEFAULT_FAVORITES_SORT);
  const [removingItemKey, setRemovingItemKey] = useState<string | null>(null);
  const [removeFeedback, setRemoveFeedback] = useState<string | null>(null);

  const items = useMemo(
    () => flattenFavoritesPages(favoritesQuery.data?.pages ?? []),
    [favoritesQuery.data?.pages],
  );

  const displayItems = useLibraryDisplayItems({
    items,
    typeFilter,
    sort,
  });

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleBrowse = useCallback(() => {
    router.push('/(tabs)/search');
  }, [router]);

  const handleItemPress = useCallback(
    (item: LibraryItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  const handleRemoveItem = useCallback(
    (item: LibraryItem) => {
      if (removeFavorite.isPending) {
        return;
      }

      const itemKey = getLibraryItemKey(item);
      setRemovingItemKey(itemKey);
      removeFavorite.mutate(
        { contentType: item.type, contentId: item.id },
        {
          onError: () => {
            setRemoveFeedback('Could not remove this favorite. Please try again.');
          },
          onSettled: () => {
            setRemovingItemKey(null);
          },
        },
      );
    },
    [removeFavorite],
  );

  const handleLoadMore = useCallback(() => {
    if (
      !favoritesQuery.hasNextPage ||
      favoritesQuery.isFetchingNextPage ||
      favoritesQuery.isFetching
    ) {
      return;
    }

    void favoritesQuery.fetchNextPage();
  }, [favoritesQuery]);

  const handleRefresh = useCallback(() => {
    void favoritesQuery.refetch();
  }, [favoritesQuery]);

  const handleRetryNextPage = useCallback(() => {
    void favoritesQuery.fetchNextPage();
  }, [favoritesQuery]);

  const renderItem = useCallback(
    ({ item }: { item: LibraryItem }) => (
      <LibraryContentCard
        item={item}
        isRemoving={removingItemKey === getLibraryItemKey(item)}
        removeIcon="heart"
        removeAccessibilityLabel="favorites"
        onPress={handleItemPress}
        onRemove={handleRemoveItem}
      />
    ),
    [handleItemPress, handleRemoveItem, removingItemKey],
  );

  const listControls = (
    <View style={styles.controls}>
      <SearchFilterControl value={typeFilter} onChange={setTypeFilter} />
      <LibrarySortControl
        value={sort}
        options={FAVORITES_SORT_OPTIONS}
        onChange={setSort}
      />
    </View>
  );

  const listHeader = (
    <View style={styles.header}>
      <DetailBackButton />
      <AppText variant="title">Favorites</AppText>
      <AppText variant="bodySmall" muted>
        Your saved movies and TV shows
      </AppText>
      {items.length > 0 ? listControls : null}
      <FeedbackMessage
        message={removeFeedback}
        tone="error"
        onDismiss={() => setRemoveFeedback(null)}
      />
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <LibraryEmptyState
          icon="heart"
          title="Sign in to view your favorites"
          message="Movies and TV shows you favorite will appear here after you sign in."
          actionLabel="Sign In"
          onAction={handleSignIn}
        />
      </SafeAreaView>
    );
  }

  if (favoritesQuery.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel="Loading favorites" />
      </SafeAreaView>
    );
  }

  if (favoritesQuery.isError && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message="Unable to load favorites. Please try again."
            onRetry={() => void favoritesQuery.refetch()}
            retryLabel="Retry"
          />
        </View>
      </SafeAreaView>
    );
  }

  const paginationErrorMessage = favoritesQuery.isFetchNextPageError
    ? 'Unable to load more favorites. Please try again.'
    : null;

  const filteredEmptyTitle =
    typeFilter === 'movie'
      ? 'No movie favorites match this filter'
      : typeFilter === 'tv'
        ? 'No TV favorites match this filter'
        : 'No favorites match this filter';

  const emptyComponent =
    items.length === 0 ? (
      <LibraryEmptyState
        icon="heart"
        title="You haven't added any favorites yet"
        message="Save movies and TV shows you love — they'll show up here."
        actionLabel="Browse"
        onAction={handleBrowse}
      />
    ) : (
      <LibraryEmptyState
        icon="heart"
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
          favoritesQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : favoritesQuery.isFetchNextPageError ? (
            <View style={styles.footerError}>
              <AppText variant="bodySmall" muted center>
                {paginationErrorMessage}
              </AppText>
              <AppButton title="Retry" variant="secondary" onPress={handleRetryNextPage} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={favoritesQuery.isRefetching && !favoritesQuery.isFetchingNextPage}
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
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  controls: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
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
  footerError: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
});
