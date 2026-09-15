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
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { LibraryLoadingState } from '@/features/library/components/LibraryLoadingState';
import type { LibraryTypeFilter } from '@/features/library/types';
import { SearchFilterControl } from '@/features/search/components/SearchFilterControl';
import { UpcomingCard } from '@/features/upcoming/components/UpcomingCard';
import { useUpcomingCatalog } from '@/features/upcoming/hooks/useUpcomingCatalog';
import type { UpcomingCatalogItem } from '@/features/upcoming/types';
import { flattenUpcomingPages } from '@/features/upcoming/utils/upcoming-catalog-items';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

function filterUpcomingItems(
  items: UpcomingCatalogItem[],
  filter: LibraryTypeFilter,
): UpcomingCatalogItem[] {
  if (filter === 'all') {
    return items;
  }

  return items.filter((item) => item.type === filter);
}

function upcomingItemKey(item: UpcomingCatalogItem): string {
  if (item.upcomingKind === 'TvEpisode' && item.episodeId) {
    return `episode-${item.episodeId}`;
  }

  return `${item.type}-${item.id}`;
}

export default function UpcomingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const upcomingQuery = useUpcomingCatalog();
  const [typeFilter, setTypeFilter] = useState<LibraryTypeFilter>('all');

  const items = useMemo(
    () => flattenUpcomingPages(upcomingQuery.data?.pages ?? []),
    [upcomingQuery.data?.pages],
  );

  const displayItems = useMemo(
    () => filterUpcomingItems(items, typeFilter),
    [items, typeFilter],
  );

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleItemPress = useCallback(
    (item: UpcomingCatalogItem) => {
      router.push(buildCatalogDetailRoute(item.id, item.type));
    },
    [router],
  );

  const handleLoadMore = useCallback(() => {
    if (
      !upcomingQuery.hasNextPage ||
      upcomingQuery.isFetchingNextPage ||
      upcomingQuery.isFetching
    ) {
      return;
    }

    void upcomingQuery.fetchNextPage();
  }, [upcomingQuery]);

  const handleRefresh = useCallback(() => {
    void upcomingQuery.refetch();
  }, [upcomingQuery]);

  const handleRetryNextPage = useCallback(() => {
    void upcomingQuery.fetchNextPage();
  }, [upcomingQuery]);

  const renderItem = useCallback(
    ({ item }: { item: UpcomingCatalogItem }) => (
      <View style={styles.listCard}>
        <UpcomingCard item={item} onPress={handleItemPress} />
      </View>
    ),
    [handleItemPress],
  );

  const listHeader = (
    <View style={styles.header}>
      <DetailBackButton />
      <AppText variant="title">Upcoming</AppText>
      <AppText variant="bodySmall" muted>
        {isAuthenticated
          ? 'Future releases and followed TV episodes'
          : 'Future movie and TV premieres'}
      </AppText>
      {!isAuthenticated ? (
        <AppButton title="Sign In for Followed Episodes" variant="secondary" onPress={handleSignIn} />
      ) : null}
      {items.length > 0 ? (
        <View style={styles.controls}>
          <SearchFilterControl value={typeFilter} onChange={setTypeFilter} />
        </View>
      ) : null}
    </View>
  );

  if (upcomingQuery.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <LibraryLoadingState accessibilityLabel="Loading upcoming" />
      </SafeAreaView>
    );
  }

  if (upcomingQuery.isError && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message="Unable to load upcoming titles. Please try again."
            onRetry={() => void upcomingQuery.refetch()}
            retryLabel="Retry"
          />
        </View>
      </SafeAreaView>
    );
  }

  const emptyComponent = (
    <View style={styles.filteredEmpty}>
      <AppText variant="subtitle" center>
        Nothing upcoming yet
      </AppText>
      <AppText variant="bodySmall" muted center>
        {isAuthenticated
          ? 'Follow TV shows or browse future releases to build your schedule.'
          : 'Sign in to include followed TV episodes, or browse future releases.'}
      </AppText>
      {!isAuthenticated ? (
        <AppButton title="Sign In" variant="secondary" onPress={handleSignIn} />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={displayItems}
        keyExtractor={upcomingItemKey}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={
          upcomingQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : upcomingQuery.isFetchNextPageError ? (
            <View style={styles.footerError}>
              <AppText variant="bodySmall" muted center>
                Unable to load more upcoming titles. Please try again.
              </AppText>
              <AppButton title="Retry" variant="secondary" onPress={handleRetryNextPage} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={upcomingQuery.isRefetching && !upcomingQuery.isFetchingNextPage}
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
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  listCard: {
    marginBottom: spacing.lg,
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
