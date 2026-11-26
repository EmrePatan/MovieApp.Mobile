import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { MovieAppRefreshControl } from '@/components/refresh/MovieAppRefreshControl';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '@/components/buttons/AppButton';
import { resolveTabBarLayoutMetrics } from '@/features/navigation/tab-bar-layout-metrics';
import {
  WatchDateSheet,
  type WatchDateChoice,
} from '@/features/watch-history/components/WatchDateSheet';
import { WatchHistoryTabs } from '@/features/watch-history/components/WatchHistoryTabs';
import { useShowEpisodeCount } from '@/features/watch-history/hooks/useShowEpisodeCount';
import { useUpdateWatchDates } from '@/features/watch-history/hooks/useUpdateWatchDates';
import { markWatchHistoryHintLearned } from '@/features/watch-history/utils/watch-history-hint-storage';
import {
  getSelectionKey,
  MAX_WATCH_DATE_SELECTION,
  splitSelection,
} from '@/features/watch-history/utils/watch-date';
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
import { flattenRecentWatchHistoryPages } from '@/features/watch-history/utils/flatten-recent-watch-history-pages';
import {
  groupRecentWatchHistory,
  type WatchHistoryRow,
} from '@/features/watch-history/utils/group-recent-watch-history';
import { RecentHistoryGroupCard } from '@/features/watch-history/components/RecentHistoryGroupCard';
import { buildTvDetailRoute } from '@/features/details/shared/routes';
import { shouldRequestNextInfinitePage } from '@/utils/should-request-next-infinite-page';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { ScrollToTopFab } from '@/features/navigation/ScrollToTopFab';
import { useFlatListScrollToTopControl } from '@/features/navigation/useFlatListScrollToTopControl';

export default function WatchHistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [undatedTab, setUndatedTab] = useState(false);
  const historyQuery = useRecentWatchHistory(undatedTab);
  const listRef = useRef<FlatList>(null);
  const { fabVisible, onListScroll, scrollToTop, scrollEventThrottle } =
    useFlatListScrollToTopControl(listRef);

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

  const rows = useMemo(() => groupRecentWatchHistory(items), [items]);

  const insets = useSafeAreaInsets();
  /** `null` means the list is not in selection mode. */
  const [selection, setSelection] = useState<ReadonlySet<string> | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const updateDates = useUpdateWatchDates();
  /** Set while the sheet changes a whole show instead of the hand-picked selection. */
  const [wholeShow, setWholeShow] = useState<{ tvShowId: string; title: string } | null>(null);
  const showCount = useShowEpisodeCount(wholeShow?.tvShowId ?? null, undatedTab);

  const handleSelectWholeShow = useCallback((tvShowId: string, title: string) => {
    setWholeShow({ tvShowId, title });
    setSheetVisible(true);
  }, []);

  const toggleItems = useCallback((targets: RecentWatchHistoryItemResponse[]) => {
    setSelection((current) => {
      const next = new Set(current);
      const keys = targets.map(getSelectionKey).filter((key): key is string => key !== null);
      const allSelected = keys.every((key) => next.has(key));
      for (const key of keys) {
        if (allSelected) {
          next.delete(key);
        } else if (next.size < MAX_WATCH_DATE_SELECTION) {
          next.add(key);
        }
      }
      return next;
    });
  }, []);

  const handleRowPress = useCallback(
    (item: RecentWatchHistoryItemResponse) => {
      if (selection) {
        toggleItems([item]);
      } else {
        handleItemPress(item);
      }
    },
    [handleItemPress, selection, toggleItems],
  );

  const toggleSelectionMode = () => {
    if (!selection) {
      void markWatchHistoryHintLearned();
    }
    setNotice(null);
    setSelection((current) => (current ? null : new Set()));
  };

  const changeTab = (undated: boolean) => {
    setUndatedTab(undated);
    setSelection(null);
    setNotice(null);
  };

  const closeSheet = () => {
    updateDates.reset();
    setSheetVisible(false);
    setWholeShow(null);
  };

  const handleSave = (choice: WatchDateChoice) => {
    if (!selection) {
      return;
    }

    const target = wholeShow
      ? { movieIds: [], episodeIds: [], tvShowId: wholeShow.tvShowId, undated: undatedTab }
      : splitSelection(selection);

    updateDates.mutate(
      { ...target, ...choice },
      {
        onSuccess: (result) => {
          setSheetVisible(false);
          setWholeShow(null);
          setSelection(null);
          setNotice(
            result.skippedCount > 0
              ? t('extras.historyDatesSkipped', { count: result.skippedCount })
              : t('extras.historyDatesSaved', { count: result.updatedCount }),
          );
        },
      },
    );
  };

  const handleOpenShow = useCallback(
    (tvShowId: string) => {
      openDetailFromLibraryStack(router, buildTvDetailRoute(tvShowId), 'watch-history');
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: WatchHistoryRow }) =>
      item.kind === 'show' ? (
        <RecentHistoryGroupCard
          group={item}
          onOpenEpisode={handleRowPress}
          onOpenShow={handleOpenShow}
          selectedKeys={selection ?? undefined}
          onToggleAll={toggleItems}
          onSelectWholeShow={handleSelectWholeShow}
        />
      ) : (
        <RecentHistoryCard
          item={item.item}
          onPress={handleRowPress}
          onOpenShow={handleOpenShow}
          selected={selection ? selection.has(getSelectionKey(item.item) ?? '') : undefined}
        />
      ),
    [handleOpenShow, handleRowPress, handleSelectWholeShow, selection, toggleItems],
  );

  const listHeader = (
    <View style={styles.header}>
      <DetailBackButton />
      <AppText variant="title">{t('extras.watchHistoryTitle')}</AppText>
      <AppText variant="bodySmall" muted>
        {t('extras.watchHistorySubtitle')}
      </AppText>
      {isAuthenticated ? (
        <WatchHistoryTabs undated={undatedTab} onChange={changeTab} />
      ) : null}
      {isAuthenticated && (items.length > 0 || notice) ? (
        <View style={styles.toolbar}>
          {selection ? (
            <>
              <AppText variant="bodySmall" style={styles.selectedCount}>
                {t('extras.historyDatesSelected', { count: selection.size })}
              </AppText>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() =>
                  setSelection(
                    new Set(
                      items
                        .map(getSelectionKey)
                        .filter((key): key is string => key !== null)
                        .slice(0, MAX_WATCH_DATE_SELECTION),
                    ),
                  )
                }
              >
                <AppText variant="bodySmall" style={styles.toolbarAction}>
                  {t('extras.historyDatesSelectAll')}
                </AppText>
              </Pressable>
            </>
          ) : (
            <AppText variant="bodySmall" muted style={styles.selectedCount}>
              {notice ?? ''}
            </AppText>
          )}
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={toggleSelectionMode}
            testID="watch-history-edit"
          >
            <AppText variant="bodySmall" style={styles.toolbarAction}>
              {selection ? t('common.cancel') : t('extras.historyDatesEdit')}
            </AppText>
          </Pressable>
        </View>
      ) : null}
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
      <View style={styles.listHost}>
      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(row) => row.key}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <WatchHistoryEmptyState
            title={
              undatedTab
                ? t('extras.historyDatesUndatedEmptyTitle')
                : t('library.empty.watchedTitle', { mediaLabel: t('library.empty.mediaLabels.titles') })
            }
            message={
              undatedTab
                ? t('extras.historyDatesUndatedEmptyMessage')
                : t('library.empty.watchedMessage')
            }
          />
        }
        ListFooterComponent={
          historyQuery.isFetchingNextPage ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : historyQuery.hasNextPage ? (
            // Grouped shows can absorb a whole page without changing the list height, and then
            // onEndReached never fires again.
            <AppButton
              title={t('extras.historyDatesLoadMore')}
              variant="secondary"
              onPress={handleLoadMore}
              style={styles.loadMore}
            />
          ) : null
        }
        // RN-web renders an empty list when a RefreshControl is attached.
        refreshControl={
          Platform.OS === 'web' ? undefined : (
            <MovieAppRefreshControl
              refreshing={historyQuery.isRefetching && !historyQuery.isFetchingNextPage}
              onRefresh={handleRefresh}
            />
          )
        }
        contentContainerStyle={[styles.listContent, selection && styles.listContentSelecting]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        onScroll={onListScroll}
        scrollEventThrottle={scrollEventThrottle}
      />
      <ScrollToTopFab visible={fabVisible && !selection} onPress={scrollToTop} />
      {/* Hidden under the sheet: its glass would otherwise blur this gold button into the options. */}
      {selection && !sheetVisible ? (
        <View
          style={[styles.actionBar, { bottom: resolveTabBarLayoutMetrics(insets).totalHeight + spacing.md }]}
          pointerEvents="box-none"
        >
          <AppButton
            title={t('extras.historyDatesChange')}
            onPress={() => setSheetVisible(true)}
            disabled={selection.size === 0}
          />
        </View>
      ) : null}
      <WatchDateSheet
        visible={sheetVisible}
        selectedCount={selection?.size ?? 0}
        subtitle={
          wholeShow
            ? showCount.data === undefined
              ? wholeShow.title
              : t('extras.historyDatesWholeShowSubtitle', {
                  title: wholeShow.title,
                  count: showCount.data,
                })
            : undefined
        }
        warning={
          wholeShow
            ? t(
                undatedTab
                  ? 'extras.historyDatesWholeShowWarningUndated'
                  : 'extras.historyDatesWholeShowWarningDated',
              )
            : undefined
        }
        // Never change a whole show before its size is known.
        saveDisabled={wholeShow !== null && !showCount.data}
        saving={updateDates.isPending}
        errorMessage={
          updateDates.isError
            ? isApiError(updateDates.error)
              ? updateDates.error.userMessage
              : t('extras.historyDatesError')
            : wholeShow && showCount.isError
              ? t('details.queryState.loadError')
              : null
        }
        onClose={closeSheet}
        onSave={handleSave}
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listHost: {
    flex: 1,
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
  // Room to scroll the last card and "load more" above the floating action button.
  listContentSelecting: { paddingBottom: 180 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 32,
  },
  selectedCount: { flex: 1 },
  toolbarAction: { color: colors.accent, fontWeight: '700' },
  loadMore: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  actionBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
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
