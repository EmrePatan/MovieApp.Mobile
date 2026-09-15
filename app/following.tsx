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
import { catalogItemKeyExtractor } from '@/features/catalog/utils/catalog-list-keys';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { openLibraryStackScreen } from '@/features/library/navigation/library-stack-navigation';
import { FollowingEmptyState } from '@/features/following/components/FollowingEmptyState';
import { FollowingListCard } from '@/features/following/components/FollowingListCard';
import { useFollowingCatalog } from '@/features/following/hooks/useFollowingCatalog';
import type { FollowingCatalogItem } from '@/features/following/types';
import {
  filterFollowingItems,
  flattenFollowingPages,
} from '@/features/following/utils/following-catalog-items';
import { LibraryLoadingState } from '@/features/library/components/LibraryLoadingState';
import type { LibraryTypeFilter } from '@/features/library/types';
import { SearchFilterControl } from '@/features/search/components/SearchFilterControl';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

export default function FollowingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const followingQuery = useFollowingCatalog();
  const [typeFilter, setTypeFilter] = useState<LibraryTypeFilter>('all');

  const items = useMemo(
    () => flattenFollowingPages(followingQuery.data?.pages ?? []),
    [followingQuery.data?.pages],
  );

  const displayItems = useMemo(
    () => filterFollowingItems(items, typeFilter),
    [items, typeFilter],
  );

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleBrowse = useCallback(() => {
    openLibraryStackScreen(router, '/discover', '/following');
  }, [router]);

  const handleItemPress = useCallback(
    (item: FollowingCatalogItem) => {
      openCatalogDetailFromLibraryStack(router, item.id, item.type, 'following');
    },
    [router],
  );

  const handleLoadMore = useCallback(() => {
    if (
      !followingQuery.hasNextPage ||
      followingQuery.isFetchingNextPage ||
      followingQuery.isFetching
    ) {
      return;
    }

    void followingQuery.fetchNextPage();
  }, [followingQuery]);

  const handleRefresh = useCallback(() => {
    void followingQuery.refetch();
  }, [followingQuery]);

  const handleRetryNextPage = useCallback(() => {
    void followingQuery.fetchNextPage();
  }, [followingQuery]);

  const renderItem = useCallback(
    ({ item }: { item: FollowingCatalogItem }) => (
      <FollowingListCard item={item} onPress={handleItemPress} />
    ),
    [handleItemPress],
  );

  const listControls = (
    <View style={styles.controls}>
      <SearchFilterControl value={typeFilter} onChange={setTypeFilter} />
    </View>
  );

  const listHeader = (
    <View style={styles.header}>
      <DetailBackButton />
      <AppText variant="title">Following</AppText>
      <AppText variant="bodySmall" muted>
        Movies and TV shows you follow for release updates
      </AppText>
      {items.length > 0 ? listControls : null}
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.filteredEmpty}>
          <AppText variant="subtitle" center>
            Sign in to view your following list
          </AppText>
          <AppText variant="bodySmall" muted center>
            Movies and TV shows you follow will appear here after you sign in.
          </AppText>
          <AppButton title="Sign In" variant="secondary" onPress={handleSignIn} />
        </View>
      </SafeAreaView>
    );
  }

  if (followingQuery.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel="Loading following" />
      </SafeAreaView>
    );
  }

  if (followingQuery.isError && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message="Unable to load following. Please try again."
            onRetry={() => void followingQuery.refetch()}
            retryLabel="Retry"
          />
        </View>
      </SafeAreaView>
    );
  }

  const paginationErrorMessage = followingQuery.isFetchNextPageError
    ? 'Unable to load more followed titles. Please try again.'
    : null;

  const filteredEmptyTitle =
    typeFilter === 'movie'
      ? 'No followed movies match this filter'
      : typeFilter === 'tv'
        ? 'No followed TV shows match this filter'
        : 'No followed titles match this filter';

  const emptyComponent =
    items.length === 0 ? (
      <FollowingEmptyState />
    ) : (
      <View style={styles.filteredEmpty}>
        <AppText variant="subtitle" center>
          {filteredEmptyTitle}
        </AppText>
        <AppText variant="bodySmall" muted center>
          Try a different filter or keep browsing to load more titles.
        </AppText>
        <AppButton title="Browse Discover" variant="secondary" onPress={handleBrowse} />
      </View>
    );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={displayItems}
        keyExtractor={catalogItemKeyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={
          followingQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : followingQuery.isFetchNextPageError ? (
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
            refreshing={followingQuery.isRefetching && !followingQuery.isFetchingNextPage}
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
  filteredEmpty: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
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
