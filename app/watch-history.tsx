import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { isApiError } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { ErrorView } from '@/components/common/ErrorView';
import { AppText } from '@/components/common/AppText';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { RecentHistoryCard } from '@/features/watch-history/components/RecentHistoryCard';
import { WatchHistoryEmptyState } from '@/features/watch-history/components/WatchHistoryEmptyState';
import { WatchHistoryLoadingState } from '@/features/watch-history/components/WatchHistoryLoadingState';
import { useRecentWatchHistory } from '@/features/watch-history/hooks/useRecentWatchHistory';
import type { RecentWatchHistoryItemResponse } from '@/features/watch-history/types';
import { buildRecentHistoryRoute } from '@/features/watch-history/utils/history-navigation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function WatchHistoryScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const historyQuery = useRecentWatchHistory();

  const items = useMemo(
    () => historyQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [historyQuery.data?.pages],
  );

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleItemPress = useCallback(
    (item: RecentWatchHistoryItemResponse) => {
      const route = buildRecentHistoryRoute(item);
      if (route) {
        router.push(route);
      }
    },
    [router],
  );

  const handleLoadMore = useCallback(() => {
    if (
      !historyQuery.hasNextPage ||
      historyQuery.isFetchingNextPage ||
      historyQuery.isFetching
    ) {
      return;
    }

    void historyQuery.fetchNextPage();
  }, [historyQuery]);

  const handleRefresh = useCallback(() => {
    void historyQuery.refetch();
  }, [historyQuery]);

  const renderItem = useCallback(
    ({ item }: { item: RecentWatchHistoryItemResponse }) => (
      <RecentHistoryCard item={item} onPress={handleItemPress} />
    ),
    [handleItemPress],
  );

  const listHeader = (
    <View style={styles.header}>
      <DetailBackButton />
      <AppText variant="title">Watch History</AppText>
      <AppText variant="bodySmall" muted>
        Recently watched movies and episodes
      </AppText>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <WatchHistoryEmptyState
          title="Sign in to view your watch history"
          message="Your recently watched movies and episodes will appear here."
          actionLabel="Sign In"
          onAction={handleSignIn}
        />
      </SafeAreaView>
    );
  }

  if (historyQuery.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <WatchHistoryLoadingState />
      </SafeAreaView>
    );
  }

  if (historyQuery.isError && items.length === 0) {
    const message = isApiError(historyQuery.error)
      ? historyQuery.error.userMessage
      : 'Unable to load watch history. Please try again.';

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message={message}
            onRetry={() => void historyQuery.refetch()}
            retryLabel="Try Again"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.type}-${item.movieId ?? item.episodeId}-${item.watchedAt}`}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <WatchHistoryEmptyState
            title="No watch history yet"
            message="Mark movies and episodes as watched from their detail pages."
          />
        }
        ListFooterComponent={
          historyQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={historyQuery.isRefetching && !historyQuery.isFetchingNextPage}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
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
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
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
