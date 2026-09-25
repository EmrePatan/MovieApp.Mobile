import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
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
import { openDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { buildRecentHistoryRoute } from '@/features/watch-history/utils/history-navigation';
import {
  flattenRecentWatchHistoryPages,
  recentWatchHistoryItemKey,
} from '@/features/watch-history/utils/flatten-recent-watch-history-pages';
import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function WatchHistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const historyQuery = useRecentWatchHistory();

  const items = useMemo(
    () => flattenRecentWatchHistoryPages(historyQuery.data?.pages ?? []),
    [historyQuery.data?.pages],
  );

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleItemPress = useCallback(
    (item: RecentWatchHistoryItemResponse) => {
      const route = buildRecentHistoryRoute(item);
      if (route) {
        openDetailFromLibraryStack(router, route, 'watch-history');
      }
    },
    [router],
  );

  const handleLoadMore = useCallback(() => {
    if (!shouldRequestNextInfinitePage(historyQuery)) {
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
      <AppText variant="title">{t('common.watched')}</AppText>
      <AppText variant="bodySmall" muted>
        {t('library.empty.watchedMessage')}
      </AppText>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <WatchHistoryEmptyState
          title={t('details.actions.signInWatchHistory')}
          message={t('library.hub.signInCopy')}
          actionLabel={t('common.signInTitleCase')}
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
      : t('details.queryState.loadError');

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {listHeader}
        <View style={styles.errorContainer}>
          <ErrorView
            message={message}
            onRetry={() => void historyQuery.refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={recentWatchHistoryItemKey}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <WatchHistoryEmptyState
            title={t('library.empty.watchedTitle', { mediaLabel: t('library.empty.mediaLabels.titles') })}
            message={t('library.empty.watchedMessage')}
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
          <MovieAppRefreshControl
            refreshing={historyQuery.isRefetching && !historyQuery.isFetchingNextPage}
            onRefresh={handleRefresh}
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
