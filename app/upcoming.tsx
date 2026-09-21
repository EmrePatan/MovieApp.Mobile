import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { StackListScreen } from '@/components/layout/StackListScreen';
import { mergeFlatListStyle } from '@/components/layout/flat-list-layout';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/auth/useAuth';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { openCatalogDetailFromLibraryStack } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { LibraryLoadingState } from '@/features/library/components/LibraryLoadingState';
import { LibraryMediaFilterControl } from '@/features/library/components/LibraryMediaFilterControl';
import { LibraryStackHeader } from '@/features/library/components/LibraryStackHeader';
import type { CatalogMediaFilter } from '@/features/library/types';
import { ComingUpTabBar } from '@/features/upcoming/components/ComingUpTabBar';
import { UpcomingListCard } from '@/features/upcoming/components/UpcomingListCard';
import { useUpcomingCatalog } from '@/features/upcoming/hooks/useUpcomingCatalog';
import { useComingUpInitialTab } from '@/features/upcoming/hooks/useComingUpInitialTab';
import {
  buildComingUpHref,
  type ComingUpTab,
} from '@/features/upcoming/navigation/coming-up-navigation';
import type { UpcomingCatalogItem } from '@/features/upcoming/types';
import { flattenUpcomingPages } from '@/features/upcoming/utils/upcoming-catalog-items';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

function filterUpcomingItems(
  items: UpcomingCatalogItem[],
  filter: CatalogMediaFilter,
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
  const { t } = useTranslation();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { isAuthenticated } = useAuth();
  const { activeTab, isResolvingInitialTab } = useComingUpInitialTab({
    tabParam: tab,
    isAuthenticated,
    router,
  });
  const [typeFilter, setTypeFilter] = useState<CatalogMediaFilter>('all');

  const followedQuery = useUpcomingCatalog('followed', undefined, {
    enabled: activeTab === 'for-you' && isAuthenticated,
  });
  const catalogQuery = useUpcomingCatalog('catalog', undefined, {
    enabled: activeTab === 'upcoming',
  });
  const activeQuery = activeTab === 'for-you' ? followedQuery : catalogQuery;

  const items = useMemo(
    () => flattenUpcomingPages(activeQuery.data?.pages ?? []),
    [activeQuery.data?.pages],
  );

  const displayItems = useMemo(
    () => filterUpcomingItems(items, typeFilter),
    [items, typeFilter],
  );

  const handleSignIn = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const handleTabChange = useCallback((nextTab: ComingUpTab) => {
    router.setParams({ tab: nextTab });
  }, [router]);

  const handleExploreUpcoming = useCallback(() => {
    handleTabChange('upcoming');
  }, [handleTabChange]);

  const handleItemPress = useCallback(
    (item: UpcomingCatalogItem) => {
      openCatalogDetailFromLibraryStack(router, item.id, item.type, 'upcoming', {
        libraryReturnHref: buildComingUpHref(activeTab ?? 'upcoming'),
      });
    },
    [activeTab, router],
  );

  const handleLoadMore = useCallback(() => {
    if (
      !activeQuery.hasNextPage ||
      activeQuery.isFetchingNextPage ||
      activeQuery.isFetching
    ) {
      return;
    }

    void activeQuery.fetchNextPage();
  }, [activeQuery]);

  const handleRefresh = useCallback(() => {
    void activeQuery.refetch();
  }, [activeQuery]);

  const handleRetryNextPage = useCallback(() => {
    void activeQuery.fetchNextPage();
  }, [activeQuery]);

  const renderItem = useCallback(
    ({ item }: { item: UpcomingCatalogItem }) => (
      <UpcomingListCard item={item} onPress={handleItemPress} />
    ),
    [handleItemPress],
  );

  const subtitle = activeTab === 'for-you'
    ? isAuthenticated
      ? t('upcoming.subtitleForYouAuth')
      : t('upcoming.subtitleForYouGuest')
    : t('upcoming.subtitleCatalog');

  const listHeader = activeTab ? (
    <>
      <LibraryStackHeader title={t('upcoming.title')} subtitle={subtitle}>
        {activeTab === 'for-you' && !isAuthenticated ? (
          <AppButton
            title={t('upcoming.signInCta')}
            variant="secondary"
            onPress={handleSignIn}
          />
        ) : null}
        {items.length > 0 ? (
          <View style={styles.controls}>
            <LibraryMediaFilterControl value={typeFilter} onChange={setTypeFilter} />
          </View>
        ) : null}
      </LibraryStackHeader>
      <ComingUpTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  ) : (
    <LibraryStackHeader title={t('upcoming.title')} subtitle={t('upcoming.subtitleCatalog')} />
  );

  if (isResolvingInitialTab) {
    return (
      <StackListScreen header={listHeader}>
        <LibraryLoadingState accessibilityLabel={t('common.loadingUpcoming')} />
      </StackListScreen>
    );
  }

  if (activeTab === 'for-you' && !isAuthenticated) {
    return (
      <StackListScreen>
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <View style={styles.filteredEmpty}>
              <AppText variant="subtitle" center>
                {t('upcoming.guestTitle')}
              </AppText>
              <AppText variant="bodySmall" muted center>
                {t('upcoming.guestMessage')}
              </AppText>
              <AppButton title={t('common.signInTitleCase')} variant="secondary" onPress={handleSignIn} />
            </View>
          }
          style={mergeFlatListStyle()}
          contentContainerStyle={styles.listContent}
        />
      </StackListScreen>
    );
  }

  if (activeQuery.isLoading && items.length === 0) {
    return (
      <StackListScreen header={listHeader}>
        <LibraryLoadingState accessibilityLabel={t('common.loadingUpcoming')} />
      </StackListScreen>
    );
  }

  if (activeQuery.isError && items.length === 0) {
    return (
      <StackListScreen header={listHeader}>
        <View style={styles.errorContainer}>
          <ErrorView
            message={t('upcoming.loadError')}
            onRetry={() => void activeQuery.refetch()}
            retryLabel={t('common.retry')}
          />
        </View>
      </StackListScreen>
    );
  }

  const emptyComponent = activeTab === 'for-you' ? (
    <View style={styles.filteredEmpty}>
      <AppText variant="subtitle" center>
        {t('upcoming.emptyForYouTitle')}
      </AppText>
      <AppText variant="bodySmall" muted center>
        {t('upcoming.emptyForYouMessage')}
      </AppText>
      <AppButton title={t('upcoming.exploreUpcoming')} variant="secondary" onPress={handleExploreUpcoming} />
    </View>
  ) : (
    <View style={styles.filteredEmpty}>
      <AppText variant="subtitle" center>
        {t('upcoming.emptyCatalogTitle')}
      </AppText>
      <AppText variant="bodySmall" muted center>
        {t('upcoming.emptyCatalogMessage')}
      </AppText>
    </View>
  );

  return (
    <StackListScreen>
      <FlatList
        data={displayItems}
        keyExtractor={upcomingItemKey}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        ItemSeparatorComponent={ListSeparator}
        ListFooterComponent={
          activeQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : activeQuery.isFetchNextPageError ? (
            <View style={styles.footerError}>
              <AppText variant="bodySmall" muted center>
                {t('common.unableToLoadMoreUpcoming')}
              </AppText>
              <AppButton title={t('common.retry')} variant="secondary" onPress={handleRetryNextPage} />
            </View>
          ) : null
        }
        refreshControl={
          <MovieAppRefreshControl
            refreshing={activeQuery.isRefetching && !activeQuery.isFetchingNextPage}
            onRefresh={handleRefresh}
          />
        }
        style={mergeFlatListStyle()}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        initialNumToRender={layout.verticalList.initialNumToRender}
        maxToRenderPerBatch={layout.verticalList.maxToRenderPerBatch}
        windowSize={layout.verticalList.windowSize}
      />
    </StackListScreen>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  controls: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: layout.screenPaddingHorizontal,
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
